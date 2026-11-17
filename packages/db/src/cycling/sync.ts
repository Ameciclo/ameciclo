// Brings the cycling infrastructure in line with what OpenStreetMap says today.
//
// OpenStreetMap owns the ways, their geometry and tags, and which PDC relation
// each belongs to. The PDC catalog itself (stage, planned km, typology) is kept
// in our database and in the admin: this never creates or edits a project, it
// only reports relations it does not know. What someone set by hand is left
// alone: a city marked city_manual and links marked manual.
//
// Every run is one transaction and leaves a cycling_sync_run row (with a
// cycling_summary_snapshot per city), so the history of the numbers builds up.

import { eq, sql } from "drizzle-orm";

import type { Db } from "../index";
import { cyclingPdcProject, cyclingSummarySnapshot, cyclingSyncRun, cyclingWay, cyclingWayProject } from "../schema";
import { builtTypology, type OsmData, relationRef, wayGeometry } from "./osm";
import { wayTags } from "./transform";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

const BATCH = 200;

// A run that would drop more than this share of the ways is almost certainly
// a partial answer from Overpass, not real changes.
const MAX_REMOVED_SHARE = 0.2;
// Fewer PDC relations than this share of the ones we know: same suspicion.
const MIN_RELATIONS_SHARE = 0.9;

export type SyncSummary = {
  runId: number;
  osmTimestamp: string | null;
  added: number;
  updated: number;
  removed: number;
  /** Ways of Overpass outside the 14 municipalities, not stored. */
  outsideRmr: number;
  links: { added: number; removed: number };
  /** PDC relations in OpenStreetMap that are not in the catalog. */
  unknownRelations: string[];
  /** Projects of the catalog whose relation is gone from OpenStreetMap. */
  missingRelations: string[];
};

function* chunks<T>(items: T[]) {
  for (let i = 0; i < items.length; i += BATCH) yield items.slice(i, i + BATCH);
}

export async function syncCycling(
  db: Db,
  data: { pdc: OsmData; infrastructure: OsmData },
  options: { triggeredBy: string; dryRun?: boolean },
): Promise<SyncSummary> {
  const { pdc, infrastructure } = data;
  const osmTimestamp = [pdc.timestamp, infrastructure.timestamp].filter((t) => t !== null).sort().at(0) ?? null;

  const summary = await db.transaction(async (tx) => {
    const catalog = await tx
      .select({ id: cyclingPdcProject.id, ref: cyclingPdcProject.ref, relationId: cyclingPdcProject.osmRelationId })
      .from(cyclingPdcProject);
    if (catalog.length === 0) {
      throw new Error("O catálogo do PDC está vazio: rode db:import-ciclo-infra antes de sincronizar com o OSM.");
    }
    const projectOfRef = new Map(catalog.map((p) => [p.ref, p.id]));

    // Relations in OpenStreetMap, matched to the catalog by their ref.
    const known = pdc.relations.flatMap((relation) => {
      const ref = relationRef(relation.tags);
      const projectId = ref ? projectOfRef.get(ref) : undefined;
      return ref && projectId ? [{ relation, ref, projectId }] : [];
    });
    const knownRefs = new Set(known.map((k) => k.ref));
    const unknownRelations = pdc.relations.flatMap((r) => {
      const ref = relationRef(r.tags);
      return ref && knownRefs.has(ref) ? [] : [ref ?? `relation/${r.osmId}`];
    });
    const missingRelations = catalog.filter((p) => p.relationId !== null && !knownRefs.has(p.ref)).map((p) => p.ref);

    const withRelation = catalog.filter((p) => p.relationId !== null).length;
    if (known.length < withRelation * MIN_RELATIONS_SHARE) {
      throw new Error(
        `Overpass trouxe ${known.length} das ${withRelation} relações do PDC conhecidas: resposta incompleta, nada foi gravado.`,
      );
    }

    const [run] = await tx
      .insert(cyclingSyncRun)
      .values({
        kind: "osm",
        sourceRef: `overpass, OSM de ${osmTimestamp ?? "data desconhecida"}`,
        triggeredBy: options.triggeredBy,
      })
      .returning({ id: cyclingSyncRun.id });
    if (!run) throw new Error("sync run not created");

    // Ways: PDC members (kept even where nothing was built) plus every way with
    // infrastructure, each once.
    const inPdc = new Set(known.flatMap((k) => k.relation.wayIds));
    const wayOfId = new Map(infrastructure.ways.map((w) => [w.osmId, w]));
    for (const way of pdc.ways) wayOfId.set(way.osmId, way);
    const ways = [...wayOfId.values()].filter((w) => w.coordinates.length >= 2);

    let added = 0;
    let updated = 0;
    for (const batch of chunks(ways)) {
      const values = batch.map((w) => {
        const typology = builtTypology(w.tags, inPdc.has(w.osmId));
        return {
          osmId: w.osmId,
          name: w.tags.name ?? null,
          highway: w.tags.highway ?? null,
          geom: sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(wayGeometry(w))}), 4326)`,
          hasCycleway: typology !== null,
          builtTypologyKey: typology,
          tags: w.tags,
          ...wayTags(w.tags),
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
            hasCycleway: sql`excluded.has_cycleway`,
            builtTypologyKey: sql`excluded.built_typology_key`,
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

    // City: the one that holds the middle of the way, unless the admin chose.
    await tx.execute(sql`
      UPDATE cycling_way w SET city_ibge = (
        SELECT c.ibge_code FROM cycling_city c
        WHERE ST_Contains(c.boundary, CASE WHEN GeometryType(w.geom) = 'LINESTRING'
                                           THEN ST_LineInterpolatePoint(w.geom, 0.5)
                                           ELSE ST_PointOnSurface(w.geom) END)
        LIMIT 1)
      WHERE w.last_seen_run_id = ${run.id} AND NOT w.city_manual`);

    // New ways outside the 14 municipalities, and not in the PDC: not ours.
    const pdcWayIds = [...inPdc];
    const outside = await tx.execute<{ id: number }>(sql`
      DELETE FROM cycling_way
      WHERE first_seen_run_id = ${run.id} AND city_ibge IS NULL AND NOT (osm_id = ANY(${sql.raw(`ARRAY[${pdcWayIds.length ? pdcWayIds.join(",") : ""}]::bigint[]`)}))
      RETURNING id`);
    added -= outside.rows.length;

    // The relations' tags (name, state, responsible) travel with the project.
    for (const { relation, projectId } of known) {
      await tx
        .update(cyclingPdcProject)
        .set({ osmRelationId: relation.osmId, osmTags: relation.tags, updatedAt: sql`now()` })
        .where(eq(cyclingPdcProject.id, projectId));
    }

    // Way ↔ project links follow the relations' members; manual ones stay.
    const wayId = new Map(
      (await tx.select({ id: cyclingWay.id, osmId: cyclingWay.osmId }).from(cyclingWay)).map((w) => [w.osmId, w.id]),
    );
    const wanted = new Map<string, { wayId: number; projectId: number }>();
    for (const { relation, projectId } of known) {
      for (const osmId of relation.wayIds) {
        const id = wayId.get(osmId);
        if (id) wanted.set(`${id}:${projectId}`, { wayId: id, projectId });
      }
    }
    const current = await tx
      .select({ wayId: cyclingWayProject.wayId, projectId: cyclingWayProject.projectId, manual: cyclingWayProject.manual })
      .from(cyclingWayProject);
    const stale = current.filter((l) => !l.manual && !wanted.has(`${l.wayId}:${l.projectId}`));
    const have = new Set(current.map((l) => `${l.wayId}:${l.projectId}`));
    const missing = [...wanted.entries()].filter(([key]) => !have.has(key)).map(([, link]) => link);
    for (const batch of chunks(stale)) {
      await tx.execute(sql`
        DELETE FROM cycling_way_project WHERE (way_id, project_id) IN (${sql.join(
          batch.map((l) => sql`(${l.wayId}, ${l.projectId})`),
          sql`, `,
        )})`);
    }
    for (const batch of chunks(missing)) await tx.insert(cyclingWayProject).values(batch).onConflictDoNothing();

    // Ways that are no longer in OpenStreetMap stay in the database, out of the numbers.
    const [{ gone } = { gone: 0 }] = (
      await tx.execute<{ gone: number }>(sql`SELECT count(*)::int AS gone FROM cycling_way WHERE removed_at IS NULL AND last_seen_run_id <> ${run.id}`)
    ).rows;
    const [{ total } = { total: 0 }] = (
      await tx.execute<{ total: number }>(sql`SELECT count(*)::int AS total FROM cycling_way WHERE removed_at IS NULL`)
    ).rows;
    if (gone > (total || 1) * MAX_REMOVED_SHARE) {
      throw new Error(`${gone} de ${total} trechos sumiriam do OSM de uma vez: resposta suspeita, nada foi gravado.`);
    }
    const removed = await tx
      .update(cyclingWay)
      .set({ removedAt: sql`now()` })
      .where(sql`${cyclingWay.lastSeenRunId} <> ${run.id} AND ${cyclingWay.removedAt} IS NULL`)
      .returning({ id: cyclingWay.id });

    // The summary as of this run, per city: how the numbers change over time.
    await tx.insert(cyclingSummarySnapshot).select(
      tx
        .select({
          runId: sql<number>`${run.id}`.as("run_id"),
          cityIbge: sql<number>`city_ibge`.as("city_ibge"),
          pdcRealizadoDesignadoKm: sql<number>`pdc_realizado_designado_km`.as("pdc_realizado_designado_km"),
          pdcRealizadoNaoDesignadoKm: sql<number>`pdc_realizado_nao_designado_km`.as("pdc_realizado_nao_designado_km"),
          realizadoForaPdcKm: sql<number>`realizado_fora_pdc_km`.as("realizado_fora_pdc_km"),
          pdcNaoRealizadoKm: sql<number>`pdc_nao_realizado_km`.as("pdc_nao_realizado_km"),
          // What the plan covers in the city, by the geometry of the ways.
          plannedKm: sql<number>`pdc_realizado_designado_km + pdc_realizado_nao_designado_km + pdc_nao_realizado_km`.as("planned_km"),
        })
        .from(sql`cycling_city_summary`),
    );

    await tx
      .update(cyclingSyncRun)
      .set({ status: "success", finishedAt: sql`now()`, waysAdded: added, waysUpdated: updated, waysRemoved: removed.length })
      .where(eq(cyclingSyncRun.id, run.id));

    const result: SyncSummary = {
      runId: run.id,
      osmTimestamp,
      added,
      updated,
      removed: removed.length,
      outsideRmr: outside.rows.length,
      links: { added: missing.length, removed: stale.length },
      unknownRelations,
      missingRelations,
    };
    if (options.dryRun) {
      // Roll everything back, the run row included.
      throw new DryRun(result);
    }
    return result;
  }).catch((error: unknown) => {
    if (error instanceof DryRun) return error.summary;
    throw error;
  });

  return summary;
}

class DryRun extends Error {
  constructor(readonly summary: SyncSummary) {
    super("dry run");
  }
}
