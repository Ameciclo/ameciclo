import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parse } from "csv-parse/sync";
import { eq, sql } from "drizzle-orm";

import { withDb } from "../src";
import { agenciesFromDescription, RMR_CITIES, TYPOLOGIES, typologyKey, wayTags } from "../src/cycling/transform";
import {
  cyclingAgency,
  cyclingCity,
  cyclingPdcProject,
  cyclingPdcProjectAgency,
  cyclingPdcProjectCity,
  cyclingSyncRun,
  cyclingTypology,
  cyclingWay,
  cyclingWayProject,
} from "../src/schema";

// Imports the cycling infrastructure (PDC Cicloviário projects and the ways
// mapped in OpenStreetMap) from the atlas export. Files expected in the import
// directory (data/cycling/ is git-ignored):
//
//   ways.csv             one row per way, with its geometry and tags as GeoJSON
//   relations.csv        PDC projects
//   relations_cities.csv project → city
//   osm-links.json       from the raw Overpass output: the tags of each project
//                        relation (responsible agency) and the relations each
//                        way belongs to (a few belong to 2 projects)
//
//   pnpm --filter @ameciclo/db db:import-ciclo-infra              read, clean, write
//   pnpm --filter @ameciclo/db db:import-ciclo-infra -- --dry-run read and report only
//
// Safe to run again: everything is matched on a natural key. Cities marked
// city_manual and links marked manual are left alone.

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

const dryRun = process.argv.includes("--dry-run");
const dir = resolve(process.env.CYCLING_DIR ?? join(import.meta.dirname, "../../../data/cycling"));
const municipalitiesFile = join(import.meta.dirname, "../../../apps/web/public/data/pernambuco-municipios.geojson");
const BATCH = 200;

const csv = (file: string): Record<string, string>[] =>
  parse(readFileSync(join(dir, file), "utf8"), { columns: true, skip_empty_lines: true });

type OsmLinks = { relations: Record<string, Record<string, string>>; ways: Record<string, number[]> };
type Municipality = { properties: { id: string; name: string }; geometry: unknown };

function stringTags(tags: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(tags).filter((e): e is [string, string] => typeof e[1] === "string"));
}

function* chunks<T>(items: T[]) {
  for (let i = 0; i < items.length; i += BATCH) yield items.slice(i, i + BATCH);
}

const wayRows = csv("ways.csv");
const projectRows = csv("relations.csv").filter((r) => r.pdc_ref !== "NOTPDC");
const projectCityRows = csv("relations_cities.csv");
const osmLinks: OsmLinks = JSON.parse(readFileSync(join(dir, "osm-links.json"), "utf8"));
const municipalities: { features: Municipality[] } = JSON.parse(readFileSync(municipalitiesFile, "utf8"));

// Relation tags and the relations each way belongs to, from the raw Overpass data.
const relationTags = new Map(Object.entries(osmLinks.relations).map(([id, tags]) => [Number(id), tags]));
const relationsOfWay = new Map(Object.entries(osmLinks.ways).map(([id, rels]) => [Number(id), rels]));

const projectByAtlasId = new Map(projectRows.map((r) => [r.id, r]));
const projectByOsmRelation = new Map(projectRows.filter((r) => r.osm_id).map((r) => [Number(r.osm_id), r]));

// Report what was read.
const agencies = new Map<string, number>();
for (const p of projectRows) {
  const names = agenciesFromDescription(relationTags.get(Number(p.osm_id))?.description);
  for (const a of names.length ? names : ["(sem responsável)"]) agencies.set(a, (agencies.get(a) ?? 0) + 1);
}
const multiProject = [...relationsOfWay.values()].filter((r) => r.length > 1).length;
console.log(`ways.csv: ${wayRows.length} trechos`);
console.log(`projetos: ${projectRows.length}, cidades dos projetos: ${projectCityRows.length}`);
console.log(`trechos em mais de um projeto (Overpass): ${multiProject}`);
console.log("responsáveis:", Object.fromEntries(agencies));

const problems: string[] = [];
const unknownTypology = new Set<string>();
for (const w of wayRows) {
  if (w.cycleway_typology !== "none" && !typologyKey(w.cycleway_typology)) unknownTypology.add(w.cycleway_typology);
  if (w.relation_id !== "0" && !projectByAtlasId.has(w.relation_id)) problems.push(`trecho ${w.osm_id}: projeto ${w.relation_id} não existe`);
}
if (unknownTypology.size) problems.push(`tipologias desconhecidas: ${[...unknownTypology].join(", ")}`);
for (const p of projectRows) if (!typologyKey(p.pdc_typology)) problems.push(`projeto ${p.pdc_ref}: tipologia "${p.pdc_typology}"`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
if (dryRun) {
  console.log("--dry-run: nada foi escrito");
  process.exit(0);
}

await withDb(connectionString, (db) =>
  db.transaction(async (tx) => {
    const [run] = await tx
      .insert(cyclingSyncRun)
      .values({ kind: "import", sourceRef: "atlas export (fix-dbs-and-apis-v2)", triggeredBy: "db:import-ciclo-infra" })
      .returning({ id: cyclingSyncRun.id });
    if (!run) throw new Error("sync run not created");

    await tx.insert(cyclingTypology).values([...TYPOLOGIES]).onConflictDoNothing();

    // Cities: the 14 of the RMR, with their boundary.
    const rmr = new Set(RMR_CITIES);
    const cities = municipalities.features.filter((m) => rmr.has(Number(m.properties.id)));
    if (cities.length !== RMR_CITIES.length) throw new Error(`expected ${RMR_CITIES.length} RMR cities, found ${cities.length}`);
    for (const m of cities) {
      const boundary = sql`ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(m.geometry)}), 4326))`;
      await tx
        .insert(cyclingCity)
        .values({ ibgeCode: Number(m.properties.id), name: m.properties.name, isRmr: true, boundary })
        .onConflictDoUpdate({ target: cyclingCity.ibgeCode, set: { name: m.properties.name, isRmr: true, boundary } });
    }

    // Agencies and projects.
    const agenciesOf = (p: Record<string, string>) => agenciesFromDescription(relationTags.get(Number(p.osm_id))?.description);
    const agencyNames = [...new Set(projectRows.flatMap(agenciesOf))];
    if (agencyNames.length) await tx.insert(cyclingAgency).values(agencyNames.map((name) => ({ name }))).onConflictDoNothing();
    const agencyId = new Map((await tx.select().from(cyclingAgency)).map((a) => [a.name, a.id]));

    for (const p of projectRows) {
      const tags = relationTags.get(Number(p.osm_id));
      const values = {
        ref: p.pdc_ref,
        osmRelationId: p.osm_id ? Number(p.osm_id) : null,
        name: p.name,
        typologyKey: typologyKey(p.pdc_typology) ?? "",
        stage: p.notes === "existing" || p.notes === "planned" ? p.notes : ("proposed" as const),
        stretch: p.pdc_stretch || null,
        plannedKm: p.pdc_km ? Number(p.pdc_km) : null,
        notes: p.pdc_notes || null,
        osmTags: tags ?? null,
      };
      await tx
        .insert(cyclingPdcProject)
        .values(values)
        .onConflictDoUpdate({ target: cyclingPdcProject.ref, set: { ...values, updatedAt: sql`now()` } });
    }
    const projectId = new Map((await tx.select().from(cyclingPdcProject)).map((p) => [p.ref, p.id]));
    const projectAgencies = projectRows.flatMap((p) => {
      const pid = projectId.get(p.pdc_ref);
      return pid ? agenciesOf(p).flatMap((name) => agencyId.get(name) ?? []).map((aid) => ({ projectId: pid, agencyId: aid })) : [];
    });
    if (projectAgencies.length) await tx.insert(cyclingPdcProjectAgency).values(projectAgencies).onConflictDoNothing();
    const idOfAtlasProject = (atlasId: string) => {
      const ref = projectByAtlasId.get(atlasId)?.pdc_ref;
      return ref ? projectId.get(ref) : undefined;
    };

    const projectCities = projectCityRows.flatMap((r) => {
      const id = idOfAtlasProject(r.relation_id);
      return id ? [{ projectId: id, cityIbge: Number(r.city_id) }] : [];
    });
    if (projectCities.length) await tx.insert(cyclingPdcProjectCity).values(projectCities).onConflictDoNothing();

    // Ways.
    const cityKnown = new Set(RMR_CITIES);
    let added = 0;
    let updated = 0;
    for (const batch of chunks(wayRows)) {
      const values = batch.map((w) => {
        const feature = JSON.parse(w.geojson).features[0];
        const tags = stringTags(feature.properties);
        const typology = typologyKey(w.cycleway_typology);
        const city = Number(w.city_id);
        return {
          osmId: Number(w.osm_id),
          name: tags.name ?? null,
          highway: tags.highway ?? null,
          geom: sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(feature.geometry)}), 4326)`,
          cityIbge: cityKnown.has(city) ? city : null,
          hasCycleway: w.has_cycleway === "true",
          builtTypologyKey: typology,
          dualCarriageway: w.dual_carriageway === "true",
          tags,
          ...wayTags(tags),
          removedAt: null,
          lastSeenRunId: run.id,
        };
      });
      const result = await tx
        .insert(cyclingWay)
        .values(values.map((v) => ({ ...v, firstSeenRunId: run.id })))
        .onConflictDoUpdate({
          target: cyclingWay.osmId,
          set: {
            name: sql`excluded.name`,
            highway: sql`excluded.highway`,
            geom: sql`excluded.geom`,
            // A city picked in the admin wins over the one in the export.
            cityIbge: sql`CASE WHEN ${cyclingWay.cityManual} THEN ${cyclingWay.cityIbge} ELSE excluded.city_ibge END`,
            hasCycleway: sql`excluded.has_cycleway`,
            builtTypologyKey: sql`excluded.built_typology_key`,
            dualCarriageway: sql`excluded.dual_carriageway`,
            tags: sql`excluded.tags`,
            surface: sql`excluded.surface`,
            oneway: sql`excluded.oneway`,
            maxspeedKmh: sql`excluded.maxspeed_kmh`,
            lit: sql`excluded.lit`,
            removedAt: sql`NULL`,
            lastSeenRunId: sql`excluded.last_seen_run_id`,
            updatedAt: sql`now()`,
          },
        })
        .returning({ inserted: sql<boolean>`(xmax = 0)` });
      for (const r of result) r.inserted ? added++ : updated++;
    }

    // Way ↔ project links: the export's single relation plus every relation
    // the raw Overpass data lists for the way.
    const wayId = new Map((await tx.select({ id: cyclingWay.id, osmId: cyclingWay.osmId }).from(cyclingWay)).map((w) => [w.osmId, w.id]));
    const links = new Map<string, { wayId: number; projectId: number }>();
    const mismatches: string[] = [];
    for (const w of wayRows) {
      const osmId = Number(w.osm_id);
      const wid = wayId.get(osmId);
      if (!wid) continue;
      const ids = new Set<number>();
      const fromExport = w.relation_id !== "0" ? idOfAtlasProject(w.relation_id) : undefined;
      if (fromExport) ids.add(fromExport);
      for (const rel of relationsOfWay.get(osmId) ?? []) {
        const ref = projectByOsmRelation.get(rel)?.pdc_ref;
        const pid = ref ? projectId.get(ref) : undefined;
        if (pid) ids.add(pid);
      }
      if (fromExport && !ids.has(fromExport)) mismatches.push(String(osmId));
      for (const pid of ids) links.set(`${wid}:${pid}`, { wayId: wid, projectId: pid });
    }
    for (const batch of chunks([...links.values()])) await tx.insert(cyclingWayProject).values(batch).onConflictDoNothing();

    // Ways no longer in the export are kept, marked as removed.
    const removed = await tx
      .update(cyclingWay)
      .set({ removedAt: sql`now()` })
      .where(sql`${cyclingWay.lastSeenRunId} <> ${run.id} AND ${cyclingWay.removedAt} IS NULL`)
      .returning({ id: cyclingWay.id });

    await tx
      .update(cyclingSyncRun)
      .set({ status: "success", finishedAt: sql`now()`, waysAdded: added, waysUpdated: updated, waysRemoved: removed.length })
      .where(eq(cyclingSyncRun.id, run.id));

    // Checks: roll back if the database does not hold what was read.
    const [counts] = (
      await tx.execute(sql`
        SELECT (SELECT count(*) FROM cycling_way WHERE removed_at IS NULL)::int AS ways,
               (SELECT count(*) FROM cycling_pdc_project)::int AS projects`)
    ).rows as { ways: number; projects: number }[];
    if (!counts || counts.ways !== wayRows.length || counts.projects !== projectRows.length) {
      throw new Error(`contagem diverge: ${JSON.stringify(counts)} vs ${wayRows.length} trechos, ${projectRows.length} projetos`);
    }

    console.log(`trechos: ${added} novos, ${updated} atualizados, ${removed.length} removidos`);
    console.log(`vínculos trecho↔projeto: ${links.size}`);
    if (mismatches.length) console.log(`atenção: ${mismatches.length} trechos cujo projeto do export não aparece no Overpass`);
  }),
);
