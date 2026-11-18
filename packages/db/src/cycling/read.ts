import { sql } from "drizzle-orm";

import type { Db } from "../index";

// ---------------------------------------------------------------------------
// Reads for the public page on cycling infrastructure. Every number comes from
// the weekly sync with OpenStreetMap (sync.ts), through the views
// cycling_way_status and cycling_city_summary: a dual carriageway counts half
// (see cycling-schema.ts), so the PDC is about 630 km, not the 800 km of lines.
// ---------------------------------------------------------------------------

/** Kilometres per status in one municipality of the RMR, as the view gives them. */
export type CyclingCityKm = {
  ibge: number;
  name: string;
  /** Built where the PDC planned, with the typology the plan asked for. */
  designatedKm: number;
  /** Built where the PDC planned, but another typology. */
  undesignatedKm: number;
  /** Built where the PDC planned nothing. */
  outsidePdcKm: number;
  /** Planned and not built. */
  notExecutedKm: number;
};

export type CyclingCityStats = CyclingCityKm & {
  /** What the PDC executed: designated + undesignated. */
  executedInPdcKm: number;
  /** What the PDC covers: executed + not executed. */
  plannedKm: number;
  /** All the infrastructure there is: executed in the PDC + outside it. */
  existingKm: number;
  /** executedInPdcKm over plannedKm, 0 to 100. */
  percent: number;
};

export function cityStats(km: CyclingCityKm): CyclingCityStats {
  const executedInPdcKm = km.designatedKm + km.undesignatedKm;
  const plannedKm = executedInPdcKm + km.notExecutedKm;
  return {
    ...km,
    executedInPdcKm,
    plannedKm,
    existingKm: executedInPdcKm + km.outsidePdcKm,
    percent: plannedKm > 0 ? (executedInPdcKm / plannedKm) * 100 : 0,
  };
}

/** Sums the cities (the numbers of the whole RMR). */
export function totalStats(cities: CyclingCityStats[]): CyclingCityStats {
  return cityStats({
    ibge: 0,
    name: "Região Metropolitana do Recife",
    designatedKm: sum(cities.map((c) => c.designatedKm)),
    undesignatedKm: sum(cities.map((c) => c.undesignatedKm)),
    outsidePdcKm: sum(cities.map((c) => c.outsidePdcKm)),
    notExecutedKm: sum(cities.map((c) => c.notExecutedKm)),
  });
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

export type CyclingOverview = {
  /** When the last successful sync with OSM finished (UTC, ISO), null before the first. */
  updatedAt: string | null;
  all: CyclingCityStats;
  cities: CyclingCityStats[];
};

export async function getCyclingOverview(db: Db): Promise<CyclingOverview> {
  const cities = await db.execute<CyclingCityKm>(sql`
    select c.ibge_code as ibge, c.name,
      coalesce(s.pdc_realizado_designado_km, 0) as "designatedKm",
      coalesce(s.pdc_realizado_nao_designado_km, 0) as "undesignatedKm",
      coalesce(s.realizado_fora_pdc_km, 0) as "outsidePdcKm",
      coalesce(s.pdc_nao_realizado_km, 0) as "notExecutedKm"
    from cycling_city c
    left join cycling_city_summary s on s.city_ibge = c.ibge_code
    where c.is_rmr
    order by c.name`);
  const [updated] = (
    await db.execute<{ at: string | null }>(sql`
      select to_char(max(finished_at) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as at
      from cycling_sync_run where kind = 'osm' and status = 'success'`)
  ).rows;
  const stats = cities.rows.map(cityStats);
  return { updatedAt: updated?.at ?? null, all: totalStats(stats), cities: stats };
}

/** A PDC project in one municipality: what it plans there and what exists. */
export type CyclingProjectRow = {
  cityIbge: number;
  ref: string;
  name: string;
  plannedTypology: string;
  /** Typologies found on the project's ways, "" when none was built. */
  builtTypologies: string;
  plannedKm: number;
  builtKm: number;
};

export async function getCyclingProjects(db: Db): Promise<CyclingProjectRow[]> {
  const result = await db.execute<CyclingProjectRow>(sql`
    select ws.city_ibge as "cityIbge", p.ref, p.name, t.label as "plannedTypology",
      coalesce(string_agg(distinct bt.label, ', ' order by bt.label) filter (where w.has_cycleway), '') as "builtTypologies",
      sum(ws.effective_length_m) / 1000 as "plannedKm",
      coalesce(sum(ws.effective_length_m) filter (where w.has_cycleway), 0) / 1000 as "builtKm"
    from cycling_way_project wp
    join cycling_way w on w.id = wp.way_id
    join cycling_way_status ws on ws.way_id = w.id
    join cycling_pdc_project p on p.id = wp.project_id
    join cycling_typology t on t.key = p.typology_key
    left join cycling_typology bt on bt.key = w.built_typology_key
    where ws.city_ibge is not null
    group by ws.city_ibge, p.id, t.label
    order by ws.city_ibge, p.name`);
  return result.rows;
}

export type CyclingFeatureCollection = {
  type: "FeatureCollection";
  features: { type: "Feature"; properties: { status_type: string }; geometry: unknown }[];
};

// ~2 m of simplification and 5 decimals; only the status travels with each way
// (the map draws by status and nothing reads a way's name), so the 4,700 ways weigh
// well under a megabyte.
const SIMPLIFY_DEGREES = 0.00002;

/** Every way that counts, with its status, ready for the map. */
export async function getCyclingWaysGeojson(db: Db): Promise<CyclingFeatureCollection> {
  const [row] = (
    await db.execute<{ collection: CyclingFeatureCollection }>(sql`
      select json_build_object(
        'type', 'FeatureCollection',
        'features', coalesce(json_agg(json_build_object(
          'type', 'Feature',
          'properties', json_build_object('status_type', ws.status),
          'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(w.geom, ${SIMPLIFY_DEGREES}), 5)::json
        )), '[]'::json)
      ) as collection
      from cycling_way w
      join cycling_way_status ws on ws.way_id = w.id
      where ws.status is not null`)
  ).rows;
  return row?.collection ?? { type: "FeatureCollection", features: [] };
}

/** One municipality in one sync: the snapshot taken when it ran. */
export type CyclingSnapshotRow = {
  runId: number;
  at: string;
  cityIbge: number;
  designatedKm: number;
  undesignatedKm: number;
  outsidePdcKm: number;
  notExecutedKm: number;
};

export type CyclingHistoryPoint = {
  runId: number;
  /** When the sync finished (UTC, ISO). */
  at: string;
  all: { executedInPdcKm: number; plannedKm: number; outsidePdcKm: number; percent: number };
  /** Same numbers per municipality, by IBGE code. */
  byCity: Record<number, { executedInPdcKm: number; plannedKm: number; percent: number }>;
};

/** Groups the snapshots by sync, oldest first. */
export function historySeries(rows: CyclingSnapshotRow[]): CyclingHistoryPoint[] {
  const runs = new Map<number, CyclingSnapshotRow[]>();
  for (const row of rows) runs.set(row.runId, [...(runs.get(row.runId) ?? []), row]);
  return [...runs.entries()]
    .sort(([a], [b]) => a - b)
    .map(([runId, snapshots]) => {
      const stats = snapshots.map((s) => cityStats({ ...s, ibge: s.cityIbge, name: "" }));
      const all = totalStats(stats);
      return {
        runId,
        at: snapshots[0]?.at ?? "",
        all: { executedInPdcKm: all.executedInPdcKm, plannedKm: all.plannedKm, outsidePdcKm: all.outsidePdcKm, percent: all.percent },
        byCity: Object.fromEntries(
          stats.map((s) => [s.ibge, { executedInPdcKm: s.executedInPdcKm, plannedKm: s.plannedKm, percent: s.percent }]),
        ),
      };
    });
}

export async function getCyclingHistory(db: Db): Promise<CyclingHistoryPoint[]> {
  const result = await db.execute<CyclingSnapshotRow>(sql`
    select r.id as "runId",
      to_char(r.finished_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as at,
      s.city_ibge as "cityIbge",
      s.pdc_realizado_designado_km as "designatedKm",
      s.pdc_realizado_nao_designado_km as "undesignatedKm",
      s.realizado_fora_pdc_km as "outsidePdcKm",
      s.pdc_nao_realizado_km as "notExecutedKm"
    from cycling_summary_snapshot s
    join cycling_sync_run r on r.id = s.run_id
    where r.kind = 'osm' and r.status = 'success'
    order by r.id, s.city_ibge`);
  return historySeries(result.rows);
}
