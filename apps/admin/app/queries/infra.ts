import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull, notExists, notInArray, sql } from "drizzle-orm";
import {
  cyclingPdcProject,
  cyclingPdcProjectAgency,
  cyclingPdcProjectCity,
  cyclingStretch,
  cyclingWay,
  cyclingWayProject,
} from "@ameciclo/db/schema";

import type { Stage, WayStatus } from "~/lib/infra";

// Cycling infrastructure: the PDC projects (the plan) and the OpenStreetMap
// ways (what exists). Geometry and OSM tags are read-only here.

// geometry is GeoJSON text: server functions only carry serializable types.
export type MapWay = { id: number; name: string | null; status: WayStatus | null; geometry: string };

export type CityRow = {
  ibge: number;
  name: string;
  isRmr: boolean;
  designado: number;
  naoDesignado: number;
  foraPdc: number;
  naoRealizado: number;
};

export type Overview = {
  cities: CityRow[];
  projects: { stage: Stage; n: number; plannedKm: number }[];
  lastRun: { id: number; kind: string; status: string; startedAt: string; waysAdded: number | null } | null;
  removed: number;
};

export const getInfraOverview = createServerFn({ method: "GET" }).handler(async (): Promise<Overview> => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const cities = await db.execute<CityRow>(sql`
      select c.ibge_code as ibge, c.name, c.is_rmr as "isRmr",
        coalesce(s.pdc_realizado_designado_km, 0)::float8 as designado,
        coalesce(s.pdc_realizado_nao_designado_km, 0)::float8 as "naoDesignado",
        coalesce(s.realizado_fora_pdc_km, 0)::float8 as "foraPdc",
        coalesce(s.pdc_nao_realizado_km, 0)::float8 as "naoRealizado"
      from cycling_city c
      left join cycling_city_summary s on s.city_ibge = c.ibge_code
      order by c.name
    `);
    const projects = await db.execute<Overview["projects"][number]>(sql`
      select stage, count(*)::int as n, coalesce(sum(planned_km), 0)::float8 as "plannedKm"
      from cycling_pdc_project group by stage order by stage
    `);
    const runs = await db.execute<NonNullable<Overview["lastRun"]>>(sql`
      select id, kind, status, started_at::text as "startedAt", ways_added as "waysAdded"
      from cycling_sync_run order by started_at desc limit 1
    `);
    const removed = await db.execute<{ n: number }>(sql`select count(*)::int as n from cycling_way where removed_at is not null`);
    return { cities: cities.rows, projects: projects.rows, lastRun: runs.rows[0] ?? null, removed: removed.rows[0]?.n ?? 0 };
  });
});

export type ProjectRow = {
  id: number;
  ref: string;
  name: string;
  typology: string;
  stage: Stage;
  agencies: string[];
  cities: string[];
  plannedKm: number | null;
  mappedKm: number;
  builtKm: number;
};

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const result = await db.execute<ProjectRow>(sql`
      select p.id, p.ref, p.name, t.label as typology, p.stage,
        coalesce((select array_agg(a.name order by a.name) from cycling_pdc_project_agency pa
                  join cycling_agency a on a.id = pa.agency_id where pa.project_id = p.id), '{}') as agencies,
        coalesce((select array_agg(c.name order by c.name) from cycling_pdc_project_city pc
                  join cycling_city c on c.ibge_code = pc.city_ibge where pc.project_id = p.id), '{}') as cities,
        p.planned_km::float8 as "plannedKm",
        coalesce(sum(w.length_m), 0)::float8 / 1000 as "mappedKm",
        coalesce(sum(w.length_m) filter (where w.has_cycleway), 0)::float8 / 1000 as "builtKm"
      from cycling_pdc_project p
      join cycling_typology t on t.key = p.typology_key
      left join cycling_way_project wp on wp.project_id = p.id
      left join cycling_way w on w.id = wp.way_id and w.removed_at is null
      group by p.id, t.label
      order by p.ref
    `);
    return result.rows;
  });
});

export type Option = { id: number; label: string };

export type ProjectDetail = {
  project: {
    id: number;
    ref: string;
    name: string;
    typologyKey: string;
    stage: Stage;
    stretch: string | null;
    plannedKm: number | null;
    notes: string | null;
    osmRelationId: number | null;
    agencyIds: number[];
    cityIds: number[];
  };
  ways: { id: number; osmId: number; name: string | null; status: WayStatus | null; km: number }[];
  map: MapWay[];
  typologies: { key: string; label: string }[];
  agencies: Option[];
  cities: Option[];
};

async function loadMapWays(db: import("@ameciclo/db").Db, wayFilter: ReturnType<typeof sql>): Promise<MapWay[]> {
  const result = await db.execute<MapWay>(sql`
    select w.id, w.name, s.status, st_asgeojson(w.geom) as geometry
    from cycling_way w
    left join cycling_way_status s on s.way_id = w.id
    where w.removed_at is null and ${wayFilter}
  `);
  return result.rows;
}

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }): Promise<ProjectDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [project] = await db.select().from(cyclingPdcProject).where(eq(cyclingPdcProject.id, data.id));
      if (!project) return null;
      const agencyIds = await db
        .select({ id: cyclingPdcProjectAgency.agencyId })
        .from(cyclingPdcProjectAgency)
        .where(eq(cyclingPdcProjectAgency.projectId, data.id));
      const cityIds = await db
        .select({ id: cyclingPdcProjectCity.cityIbge })
        .from(cyclingPdcProjectCity)
        .where(eq(cyclingPdcProjectCity.projectId, data.id));
      const ways = await db.execute<ProjectDetail["ways"][number]>(sql`
        select w.id, w.osm_id as "osmId", w.name, s.status, coalesce(w.length_m, 0)::float8 / 1000 as km
        from cycling_way_project wp
        join cycling_way w on w.id = wp.way_id and w.removed_at is null
        left join cycling_way_status s on s.way_id = w.id
        where wp.project_id = ${data.id}
        order by w.name nulls last, w.osm_id
      `);
      const typologies = await db.execute<{ key: string; label: string }>(
        sql`select key, label from cycling_typology order by sort_order`,
      );
      const agencies = await db.execute<Option>(sql`select id, name as label from cycling_agency order by name`);
      const cities = await db.execute<Option>(sql`select ibge_code as id, name as label from cycling_city order by name`);
      const map = await loadMapWays(db, sql`w.id in (select way_id from cycling_way_project where project_id = ${data.id})`);
      return {
        project: {
          id: project.id,
          ref: project.ref,
          name: project.name,
          typologyKey: project.typologyKey,
          stage: project.stage,
          stretch: project.stretch,
          plannedKm: project.plannedKm,
          notes: project.notes,
          osmRelationId: project.osmRelationId,
          agencyIds: agencyIds.map((a) => a.id),
          cityIds: cityIds.map((c) => c.id),
        },
        ways: ways.rows,
        map,
        typologies: typologies.rows,
        agencies: agencies.rows,
        cities: cities.rows,
      };
    });
  });

export type SaveProjectInput = {
  id: number;
  name: string;
  typologyKey: string;
  stage: Stage;
  stretch: string | null;
  plannedKm: number | null;
  notes: string | null;
  agencyIds: number[];
  cityIds: number[];
};

export type SaveResult = { ok: true } | { ok: false; problems: string[] };

export const saveProject = createServerFn({ method: "POST" })
  .inputValidator((input: SaveProjectInput) => input)
  .handler(async ({ data }): Promise<SaveResult> => {
    const problems: string[] = [];
    if (!data.name.trim()) problems.push("O nome é obrigatório.");
    if (data.plannedKm !== null && !(data.plannedKm >= 0)) problems.push("A extensão prevista deve ser um número positivo.");
    if (data.cityIds.length === 0) problems.push("Escolha ao menos uma cidade.");
    if (problems.length) return { ok: false, problems };

    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db.transaction(async (tx) => {
        await tx
          .update(cyclingPdcProject)
          .set({
            name: data.name.trim(),
            typologyKey: data.typologyKey,
            stage: data.stage,
            stretch: data.stretch?.trim() || null,
            plannedKm: data.plannedKm,
            notes: data.notes?.trim() || null,
            updatedAt: sql`now()`,
          })
          .where(eq(cyclingPdcProject.id, data.id));
        await tx.delete(cyclingPdcProjectAgency).where(eq(cyclingPdcProjectAgency.projectId, data.id));
        if (data.agencyIds.length)
          await tx.insert(cyclingPdcProjectAgency).values(data.agencyIds.map((agencyId) => ({ projectId: data.id, agencyId })));
        await tx.delete(cyclingPdcProjectCity).where(eq(cyclingPdcProjectCity.projectId, data.id));
        await tx.insert(cyclingPdcProjectCity).values(data.cityIds.map((cityIbge) => ({ projectId: data.id, cityIbge })));
      }),
    );
    return { ok: true };
  });

export type WayRow = {
  id: number;
  osmId: number;
  name: string | null;
  highway: string | null;
  city: string | null;
  cityManual: boolean;
  status: WayStatus | null;
  built: string | null;
  km: number;
  projects: string[];
  stretchId: number | null;
  stretchName: string | null;
};

export const listWays = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const result = await db.execute<WayRow>(sql`
      select w.id, w.osm_id as "osmId", w.name, w.highway, c.name as city, w.city_manual as "cityManual",
        s.status, t.label as built, coalesce(w.length_m, 0)::float8 / 1000 as km,
        coalesce((select array_agg(p.ref order by p.ref) from cycling_way_project wp
                  join cycling_pdc_project p on p.id = wp.project_id where wp.way_id = w.id), '{}') as projects,
        w.stretch_id as "stretchId", st.name as "stretchName"
      from cycling_way w
      left join cycling_stretch st on st.id = w.stretch_id
      left join cycling_city c on c.ibge_code = w.city_ibge
      left join cycling_typology t on t.key = w.built_typology_key
      left join cycling_way_status s on s.way_id = w.id
      where w.removed_at is null
      order by w.name nulls last, w.osm_id
    `);
    return result.rows;
  });
});

export type WayDetail = {
  way: {
    id: number;
    osmId: number;
    name: string | null;
    highway: string | null;
    cityIbge: number | null;
    cityManual: boolean;
    hasCycleway: boolean;
    built: string | null;
    surface: string | null;
    km: number;
    status: WayStatus | null;
    tags: Record<string, string>;
    firstSeen: string | null;
    lastSeen: string | null;
    stretchId: number | null;
    stretchName: string | null;
  };
  links: { projectId: number; ref: string; name: string; typology: string; manual: boolean }[];
  map: MapWay[];
  cities: Option[];
  projects: { id: number; label: string }[];
};

export const getWay = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }): Promise<WayDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const rows = await db.execute<WayDetail["way"]>(sql`
        select w.id, w.osm_id as "osmId", w.name, w.highway, w.city_ibge as "cityIbge", w.city_manual as "cityManual",
          w.has_cycleway as "hasCycleway", t.label as built, w.surface, coalesce(w.length_m, 0)::float8 / 1000 as km,
          s.status, w.tags, fr.started_at::text as "firstSeen", lr.started_at::text as "lastSeen",
          w.stretch_id as "stretchId", st.name as "stretchName"
        from cycling_way w
        left join cycling_stretch st on st.id = w.stretch_id
        left join cycling_typology t on t.key = w.built_typology_key
        left join cycling_way_status s on s.way_id = w.id
        left join cycling_sync_run fr on fr.id = w.first_seen_run_id
        left join cycling_sync_run lr on lr.id = w.last_seen_run_id
        where w.id = ${data.id}
      `);
      const way = rows.rows[0];
      if (!way) return null;
      const links = await db.execute<WayDetail["links"][number]>(sql`
        select p.id as "projectId", p.ref, p.name, t.label as typology, wp.manual
        from cycling_way_project wp
        join cycling_pdc_project p on p.id = wp.project_id
        join cycling_typology t on t.key = p.typology_key
        where wp.way_id = ${data.id}
        order by p.ref
      `);
      const cities = await db.execute<Option>(sql`select ibge_code as id, name as label from cycling_city order by name`);
      const projects = await db.execute<{ id: number; label: string }>(
        sql`select id, ref || ' · ' || name as label from cycling_pdc_project order by ref`,
      );
      return { way, links: links.rows, map: await loadMapWays(db, sql`w.id = ${data.id}`), cities: cities.rows, projects: projects.rows };
    });
  });

export type SaveWayInput = { id: number; cityIbge: number | null; projectIds: number[] };

export const saveWay = createServerFn({ method: "POST" })
  .inputValidator((input: SaveWayInput) => input)
  .handler(async ({ data }): Promise<SaveResult> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb((db) =>
      db.transaction(async (tx) => {
        // Links from the import stay; only the ones added here (manual) can be removed.
        const imported = await tx
          .select({ projectId: cyclingWayProject.projectId })
          .from(cyclingWayProject)
          .where(and(eq(cyclingWayProject.wayId, data.id), eq(cyclingWayProject.manual, false)));
        const importedIds = new Set(imported.map((l) => l.projectId));
        const wanted = new Set([...data.projectIds, ...importedIds]);

        await tx
          .delete(cyclingWayProject)
          .where(
            and(
              eq(cyclingWayProject.wayId, data.id),
              eq(cyclingWayProject.manual, true),
              wanted.size ? notInArray(cyclingWayProject.projectId, [...wanted]) : undefined,
            ),
          );
        const added = [...wanted].filter((projectId) => !importedIds.has(projectId));
        if (added.length)
          await tx
            .insert(cyclingWayProject)
            .values(added.map((projectId) => ({ wayId: data.id, projectId, manual: true })))
            .onConflictDoNothing();

        if (data.cityIbge !== null)
          await tx.update(cyclingWay).set({ cityIbge: data.cityIbge, cityManual: true, updatedAt: sql`now()` }).where(eq(cyclingWay.id, data.id));
        return { ok: true as const };
      }),
    );
  });

// Trechos: segments composed into one stretch of street, the unit the IDECiclo evaluates.

export type StretchWay = { id: number; osmId: number; name: string | null; highway: string | null; status: WayStatus | null; km: number };

export type StretchDetail = {
  stretch: { id: number; name: string; city: string | null };
  ways: StretchWay[];
  // Free segments within 300 m of the stretch, to add to it.
  nearby: StretchWay[];
  map: MapWay[];
};

export const getStretch = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }): Promise<StretchDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [stretch] = await db.select().from(cyclingStretch).where(eq(cyclingStretch.id, data.id));
      if (!stretch) return null;
      const wayColumns = sql`w.id, w.osm_id as "osmId", w.name, w.highway, s.status, coalesce(w.length_m, 0)::float8 / 1000 as km`;
      const ways = await db.execute<StretchWay>(sql`
        select ${wayColumns} from cycling_way w
        left join cycling_way_status s on s.way_id = w.id
        where w.stretch_id = ${data.id} and w.removed_at is null
        order by w.name nulls last, w.osm_id
      `);
      const city = await db.execute<{ name: string }>(sql`
        select c.name from cycling_way w join cycling_city c on c.ibge_code = w.city_ibge
        where w.stretch_id = ${data.id} and w.removed_at is null
        group by c.name order by count(*) desc limit 1
      `);
      const nearby = await db.execute<StretchWay>(sql`
        select ${wayColumns} from cycling_way w
        left join cycling_way_status s on s.way_id = w.id
        where w.stretch_id is null and w.removed_at is null
          and st_dwithin(w.geom::geography, (select st_collect(geom) from cycling_way where stretch_id = ${data.id})::geography, 300)
        order by w.name nulls last, w.osm_id
        limit 200
      `);
      const map = await loadMapWays(db, sql`w.stretch_id = ${data.id}`);
      return { stretch: { id: stretch.id, name: stretch.name, city: city.rows[0]?.name ?? null }, ways: ways.rows, nearby: nearby.rows, map };
    });
  });

export type NewStretch = { name: string; wayIds: number[] };

// Confirms suggested groups, or a hand-made one. A way already in a trecho stays where it is.
export const createStretches = createServerFn({ method: "POST" })
  .inputValidator((input: { stretches: NewStretch[] }) => input)
  .handler(async ({ data }): Promise<{ created: number }> => {
    const stretches = data.stretches.filter((s) => s.name.trim() && s.wayIds.length > 0);
    if (stretches.length === 0) return { created: 0 };
    const { withDb } = await import("~/lib/db.server");
    return withDb((db) =>
      db.transaction(async (tx) => {
        const inserted = await tx
          .insert(cyclingStretch)
          .values(stretches.map((s) => ({ name: s.name.trim() })))
          .returning({ id: cyclingStretch.id });
        const pairs = inserted.flatMap((row, i) => (stretches[i]?.wayIds ?? []).map((w) => ({ w, s: row.id })));
        await tx.execute(sql`
          update cycling_way set stretch_id = v.s, updated_at = now()
          from jsonb_to_recordset(${JSON.stringify(pairs)}::jsonb) as v(w int, s int)
          where cycling_way.id = v.w and cycling_way.stretch_id is null
        `);
        // A group whose ways were all taken meanwhile leaves no trecho behind.
        await tx.delete(cyclingStretch).where(
          and(
            inArray(
              cyclingStretch.id,
              inserted.map((r) => r.id),
            ),
            notExists(tx.select({ one: sql`1` }).from(cyclingWay).where(eq(cyclingWay.stretchId, cyclingStretch.id))),
          ),
        );
        return { created: inserted.length };
      }),
    );
  });

export type SaveStretchInput = { id: number; name: string; wayIds: number[] };

export const saveStretch = createServerFn({ method: "POST" })
  .inputValidator((input: SaveStretchInput) => input)
  .handler(async ({ data }): Promise<SaveResult> => {
    const problems: string[] = [];
    if (!data.name.trim()) problems.push("O nome é obrigatório.");
    if (data.wayIds.length === 0) problems.push("Um trecho precisa de ao menos um segmento. Para desfazê-lo, use Desfazer trecho.");
    if (problems.length) return { ok: false, problems };

    const { withDb } = await import("~/lib/db.server");
    return withDb((db) =>
      db.transaction(async (tx) => {
        await tx.update(cyclingStretch).set({ name: data.name.trim(), updatedAt: sql`now()` }).where(eq(cyclingStretch.id, data.id));
        await tx
          .update(cyclingWay)
          .set({ stretchId: null, updatedAt: sql`now()` })
          .where(and(eq(cyclingWay.stretchId, data.id), notInArray(cyclingWay.id, data.wayIds)));
        // Only free segments can join: one that belongs to another trecho is left alone.
        await tx
          .update(cyclingWay)
          .set({ stretchId: data.id, updatedAt: sql`now()` })
          .where(and(inArray(cyclingWay.id, data.wayIds), isNull(cyclingWay.stretchId)));
        return { ok: true as const };
      }),
    );
  });

// The segments go back to being loose; nothing else is lost.
export const deleteStretch = createServerFn({ method: "POST" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) => db.delete(cyclingStretch).where(eq(cyclingStretch.id, data.id)));
    return { ok: true };
  });

export type RunRow = {
  id: number;
  kind: string;
  sourceRef: string | null;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  waysAdded: number | null;
  waysUpdated: number | null;
  waysRemoved: number | null;
  error: string | null;
  triggeredBy: string | null;
};

export const listRuns = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const result = await db.execute<RunRow>(sql`
      select id, kind, source_ref as "sourceRef", status, started_at::text as "startedAt", finished_at::text as "finishedAt",
        ways_added as "waysAdded", ways_updated as "waysUpdated", ways_removed as "waysRemoved", error, triggered_by as "triggeredBy"
      from cycling_sync_run order by started_at desc
    `);
    return result.rows;
  });
});

export const infraOverviewQueryOptions = () => queryOptions({ queryKey: ["infra", "overview"], queryFn: () => getInfraOverview() });
export const projectsQueryOptions = () => queryOptions({ queryKey: ["infra", "projects"], queryFn: () => listProjects() });
export const projectQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["infra", "project", id], queryFn: () => getProject({ data: { id } }) });
export const waysQueryOptions = () => queryOptions({ queryKey: ["infra", "ways"], queryFn: () => listWays() });
export const wayQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["infra", "way", id], queryFn: () => getWay({ data: { id } }) });
export const stretchQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["infra", "stretch", id], queryFn: () => getStretch({ data: { id } }) });
export const runsQueryOptions = () => queryOptions({ queryKey: ["infra", "runs"], queryFn: () => listRuns() });

// Everything a project or way edit can change.
export const infraQueryKey = ["infra"];

