import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { ideCity, ideForm, ideSegment } from "@ameciclo/db/schema";

import { DF_REGIONS, DF_STATE_ID } from "~/lib/osm/ibge";
import { type Prefill, parseTechnical, prefillSchema, rawEnvelope, type Technical, technicalSchema } from "~/lib/osm/technical";
import {
  type Classification,
  geometrySchema,
  IBGE_CITY_SCHEMA,
  IBGE_STATE_SCHEMA,
  type IbgeCity,
  type IbgeState,
  isClassification,
  isSegmentType,
  type SegmentGeometry,
  type SegmentType,
} from "~/lib/osm/types";

// The assessment session: choose a city, download its cycle network from the
// OpenStreetMap, refine the segments (names, types, hierarchy, merges, the
// trash) and pick the structure to evaluate. The original site did this through
// a hand-written REST layer; these are the same operations as server functions.
//
// TODO(auth): none of these check who is asking. Permissions by role, module,
// state and city plug in here (the original's `refinamento_dados_cidade` and
// `avaliacao_estrutura_cicloviaria` modules) once the login is ported.

// ---------------------------------------------------------------------------
// IBGE
// ---------------------------------------------------------------------------

export const listStates = createServerFn({ method: "GET" }).handler(async (): Promise<IbgeState[]> => {
  const { fetchIbge } = await import("~/lib/osm/overpass.server");
  const states = IBGE_STATE_SCHEMA.parse(await fetchIbge("estados"));
  return [...states].sort((a, b) => a.nome.localeCompare(b.nome));
});

export const listIbgeCities = createServerFn({ method: "GET" })
  .inputValidator((input: { stateId: number }) => input)
  .handler(async ({ data }): Promise<IbgeCity[]> => {
    if (data.stateId === DF_STATE_ID) return DF_REGIONS;
    const { fetchIbge } = await import("~/lib/osm/overpass.server");
    return IBGE_CITY_SCHEMA.parse(await fetchIbge(`estados/${data.stateId}/municipios`));
  });

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export type StoredCity = {
  id: string;
  name: string;
  state: string;
  structuralKm: number;
  feederKm: number;
  localKm: number;
  updatedAt: string;
  segments: number;
  evaluated: number;
};

async function loadCities(db: import("@ameciclo/db").Db, onlyId?: string): Promise<StoredCity[]> {
  const rows = await db
    .select({
      id: ideCity.id,
      name: ideCity.name,
      state: ideCity.state,
      structuralKm: ideCity.structuralKm,
      feederKm: ideCity.feederKm,
      localKm: ideCity.localKm,
      updatedAt: ideCity.updatedAt,
      segments: sql<number>`count(${ideSegment.id}) filter (where ${ideSegment.parentSegmentId} is null and ${ideSegment.deletedAt} is null)::int`,
      evaluated: sql<number>`count(${ideSegment.id}) filter (where ${ideSegment.parentSegmentId} is null and ${ideSegment.deletedAt} is null and ${ideSegment.evaluated})::int`,
    })
    .from(ideCity)
    .leftJoin(ideSegment, eq(ideSegment.cityId, ideCity.id))
    .where(onlyId ? eq(ideCity.id, onlyId) : undefined)
    .groupBy(ideCity.id)
    .orderBy(sql`${ideCity.updatedAt} desc`);
  return rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
}

export const listStoredCities = createServerFn({ method: "GET" }).handler(async (): Promise<StoredCity[]> => {
  const { withDb } = await import("~/lib/db.server");
  return withDb((db) => loadCities(db));
});

const INSERT_CHUNK = 500;

export type DownloadCityInput = { cityId: string; cityName: string; stateName: string; replace: boolean };

// Downloads the city's roads and cycle structures from the OpenStreetMap and
// stores them. With replace, the city's segments are thrown away first, which
// the evaluations hang from, so it is refused once there are forms.
export const downloadCity = createServerFn({ method: "POST" })
  .inputValidator((input: DownloadCityInput) => input)
  .handler(async ({ data }): Promise<{ segments: number }> => {
    const { fetchCityWays, fetchHighwayStats } = await import("~/lib/osm/overpass.server");
    const { calculateCityStats, convertToSegments } = await import("~/lib/osm/convert.server");
    const { withDb } = await import("~/lib/db.server");

    if (data.replace) {
      const forms = await withDb((db) =>
        db.select({ n: count() }).from(ideForm).where(eq(ideForm.cityId, data.cityId)),
      );
      if ((forms[0]?.n ?? 0) > 0) {
        throw new Error("Esta cidade já tem avaliações salvas; recarregar os dados do OpenStreetMap as apagaria.");
      }
    }

    const stats = calculateCityStats(await fetchHighwayStats(data.cityId));
    const segments = convertToSegments(await fetchCityWays(data.cityId), data.cityId);

    await withDb((db) =>
      db.transaction(async (tx) => {
        await tx
          .insert(ideCity)
          .values({ id: data.cityId, name: data.cityName, state: data.stateName, ...stats })
          .onConflictDoUpdate({
            target: ideCity.id,
            set: { name: data.cityName, state: data.stateName, ...stats, updatedAt: sql`now()` },
          });
        if (data.replace) await tx.delete(ideSegment).where(eq(ideSegment.cityId, data.cityId));

        for (let i = 0; i < segments.length; i += INSERT_CHUNK) {
          await tx
            .insert(ideSegment)
            .values(segments.slice(i, i + INSERT_CHUNK).map((s) => ({ ...s, cityId: data.cityId })))
            .onConflictDoNothing();
        }
      }),
    );
    return { segments: segments.length };
  });

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------

export type SegmentItem = {
  id: string;
  name: string;
  type: SegmentType;
  classification: Classification | null;
  km: number;
  neighborhood: string | null;
  evaluated: boolean;
  parentId: string | null;
  isMerged: boolean;
  // The OpenStreetMap way behind a plain segment.
  osmId: string | null;
  prefill: Prefill | null;
  blocks: number | null;
  intersections: number | null;
};

export type Workspace = { city: StoredCity | null; segments: SegmentItem[]; deleted: SegmentItem[] };

function osmIdOf(id: string, cityId: string, isMerged: boolean): string | null {
  const suffix = id.startsWith(`${cityId}_`) ? id.slice(cityId.length + 1) : id;
  return !isMerged && /^\d+$/.test(suffix) ? suffix : null;
}

function classificationOf(value: string | null): Classification | null {
  if (value === null) return null;
  if (isClassification(value)) return value;
  throw new Error(`Hierarquia desconhecida no banco: ${value}`);
}

async function loadSegments(db: import("@ameciclo/db").Db, cityId: string, deleted: boolean): Promise<SegmentItem[]> {
  const rows = await db
    .select({
      id: ideSegment.id,
      name: ideSegment.name,
      type: ideSegment.type,
      classification: ideSegment.classification,
      km: ideSegment.length,
      neighborhood: ideSegment.neighborhood,
      evaluated: ideSegment.evaluated,
      parentId: ideSegment.parentSegmentId,
      isMerged: ideSegment.isMerged,
      // Only the light parts of the technical envelope: the tags and the
      // intersections stay in the database until a segment is opened.
      prefill: sql<unknown>`${ideSegment.osmAdvanced} -> 'ideciclo_prefill'`,
      blocks: sql<number | null>`coalesce(${ideSegment.osmAdvanced} ->> 'blocks_count', ${ideSegment.osmAdvanced} ->> 'estimated_blocks_count')::float8`,
      intersections: sql<number | null>`coalesce(${ideSegment.osmAdvanced} ->> 'intersections_count', ${ideSegment.osmAdvanced} ->> 'estimated_intersections_count')::float8`,
    })
    .from(ideSegment)
    .where(and(eq(ideSegment.cityId, cityId), deleted ? isNotNull(ideSegment.deletedAt) : isNull(ideSegment.deletedAt)))
    .orderBy(ideSegment.name, ideSegment.id);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    classification: classificationOf(row.classification),
    km: row.km,
    neighborhood: row.neighborhood,
    evaluated: row.evaluated ?? false,
    parentId: row.parentId,
    isMerged: row.isMerged ?? false,
    osmId: osmIdOf(row.id, cityId, row.isMerged ?? false),
    prefill: row.prefill === null || row.prefill === undefined ? null : prefillSchema.parse(row.prefill),
    blocks: row.blocks,
    intersections: row.intersections,
  }));
}

export const getWorkspace = createServerFn({ method: "GET" })
  .inputValidator((input: { cityId: string }) => input)
  .handler(async ({ data }): Promise<Workspace> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [city] = await loadCities(db, data.cityId);
      if (!city) return { city: null, segments: [], deleted: [] };
      return { city, segments: await loadSegments(db, data.cityId, false), deleted: await loadSegments(db, data.cityId, true) };
    });
  });

export type SegmentDetail = {
  id: string;
  name: string;
  // GeoJSON text: server functions only carry serializable types.
  geometry: string;
  parts: { id: string; name: string; osmId: string | null; km: number }[];
  technical: Technical | null;
};

export const getSegmentDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<SegmentDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [segment] = await db.select().from(ideSegment).where(eq(ideSegment.id, data.id));
      if (!segment) return null;
      const children = await db
        .select({ id: ideSegment.id, name: ideSegment.name, km: ideSegment.length })
        .from(ideSegment)
        .where(and(eq(ideSegment.parentSegmentId, data.id), isNull(ideSegment.deletedAt)))
        .orderBy(ideSegment.name, ideSegment.id);
      const parts = children.length > 0 ? children : [{ id: segment.id, name: segment.name, km: segment.length }];
      return {
        id: segment.id,
        name: segment.name,
        geometry: JSON.stringify(geometrySchema.parse(segment.geometry)),
        parts: parts.map((p) => ({ ...p, osmId: osmIdOf(p.id, segment.cityId, false) })),
        technical: parseTechnical(segment.osmAdvanced),
      };
    });
  });

export type UpdateSegmentInput = { id: string; name: string; type: SegmentType; classification: Classification | null };

export const updateSegment = createServerFn({ method: "POST" })
  .inputValidator((input: UpdateSegmentInput) => input)
  .handler(async ({ data }): Promise<void> => {
    const name = data.name.trim();
    if (!name) throw new Error("O nome do trecho é obrigatório.");
    if (!isSegmentType(data.type)) throw new Error(`Tipologia desconhecida: ${data.type}`);
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db
        .update(ideSegment)
        .set({ name, type: data.type, classification: data.classification, updatedAt: sql`now()` })
        .where(eq(ideSegment.id, data.id)),
    );
  });

export type SaveTechnicalInput = {
  id: string;
  prefill: Prefill;
  blocks: number | null;
  intersections: number | null;
  // What the OpenStreetMap complement brought (tags, confidence, suggestions), if it was fetched.
  osm?: Technical;
};

// The technical complement of a segment: it is merged into the envelope that
// is already there, so what an earlier download left (tags, suggestions) stays.
export const saveTechnical = createServerFn({ method: "POST" })
  .inputValidator((input: SaveTechnicalInput) => input)
  .handler(async ({ data }): Promise<void> => {
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db.transaction(async (tx) => {
        const [segment] = await tx.select({ osmAdvanced: ideSegment.osmAdvanced }).from(ideSegment).where(eq(ideSegment.id, data.id));
        if (!segment) throw new Error("Trecho não encontrado.");
        const current = parseTechnical(segment.osmAdvanced);
        const osm = data.osm ? technicalSchema.parse(data.osm) : {};
        const next = {
          ...rawEnvelope(segment.osmAdvanced),
          ...osm,
          version: 1,
          updated_at: new Date().toISOString(),
          ideciclo_prefill: { ...current?.ideciclo_prefill, ...osm.ideciclo_prefill, ...data.prefill },
          blocks_count: data.blocks,
          estimated_blocks_count: data.blocks,
          intersections_count: data.intersections,
          estimated_intersections_count: data.intersections,
        };
        await tx.update(ideSegment).set({ osmAdvanced: next, updatedAt: sql`now()` }).where(eq(ideSegment.id, data.id));
      }),
    );
  });

export type OsmComplementResult = {
  // Values read from the tags of the ways, the longest way first for the ones that differ.
  prefill: Prefill;
  osm: Technical;
  blocks: number;
  intersections: number;
  found: number;
  asked: number;
};

// Reads the OpenStreetMap tags of the ways behind a segment (all of its parts,
// if merged) and returns what the form can be prefilled with. Nothing is saved:
// the person reviews it in the form and saves.
export const fetchOsmComplement = createServerFn({ method: "POST" })
  .inputValidator((input: { segmentId: string }) => input)
  .handler(async ({ data }): Promise<OsmComplementResult> => {
    const { withDb } = await import("~/lib/db.server");
    const { fetchOsmComplements } = await import("~/lib/osm/advanced.server");

    const parts = await withDb(async (db) => {
      const [segment] = await db.select({ id: ideSegment.id, cityId: ideSegment.cityId, length: ideSegment.length }).from(ideSegment).where(eq(ideSegment.id, data.segmentId));
      if (!segment) throw new Error("Trecho não encontrado.");
      const children = await db
        .select({ id: ideSegment.id, length: ideSegment.length })
        .from(ideSegment)
        .where(and(eq(ideSegment.parentSegmentId, data.segmentId), isNull(ideSegment.deletedAt)));
      const all = children.length > 0 ? children : [segment];
      return all.map((p) => ({ osmId: osmIdOf(p.id, segment.cityId, false), length: p.length }));
    });

    const osmIds = parts.flatMap((p) => (p.osmId ? [p.osmId] : []));
    if (osmIds.length === 0) throw new Error("Este trecho não tem um OSM ID válido. Preencha os campos à mão.");

    const complements = await fetchOsmComplements(osmIds);
    if (complements.length === 0) throw new Error("O OpenStreetMap não devolveu dados para estes trechos.");

    const lengthOf = (osmId: string) => parts.find((p) => p.osmId === osmId)?.length ?? 0;
    const longestFirst = [...complements].sort((a, b) => lengthOf(b.osmId) - lengthOf(a.osmId));

    const prefill: Prefill = { pendenciasCampo: [] };
    const filled: Record<string, unknown> = {};
    for (const { technical } of longestFirst) {
      for (const [key, value] of Object.entries(technical.ideciclo_prefill ?? {})) {
        if (value !== undefined && key !== "pendenciasCampo" && !(key in filled)) filled[key] = value;
      }
    }
    const merged = prefillSchema.parse({ ...filled, pendenciasCampo: [] });
    const first = longestFirst[0]?.technical;
    return {
      prefill: merged,
      osm: {
        osm_tags: first?.osm_tags,
        osm_confidence: first?.osm_confidence,
        osm_improvement_suggestions: first?.osm_improvement_suggestions,
        intersections_preview: complements.flatMap((c) => c.technical.intersections_preview ?? []),
        relevant_intersections_count: complements.reduce((sum, c) => sum + (c.technical.relevant_intersections_count ?? 0), 0),
        connected_intersections_count: 0,
      },
      blocks: complements.reduce((sum, c) => sum + (c.technical.estimated_blocks_count ?? 1), 0),
      intersections: complements.reduce((sum, c) => sum + (c.technical.estimated_intersections_count ?? 0), 0),
      found: complements.length,
      asked: osmIds.length,
    };
  });

// ---------------------------------------------------------------------------
// Trash, merge, unmerge
// ---------------------------------------------------------------------------

// The trash is a soft delete. The parts of a deleted merged segment come loose.
export const deleteSegments = createServerFn({ method: "POST" })
  .inputValidator((input: { ids: string[] }) => input)
  .handler(async ({ data }): Promise<void> => {
    if (data.ids.length === 0) return;
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db.transaction(async (tx) => {
        await tx
          .update(ideSegment)
          .set({ parentSegmentId: null, isMerged: false })
          .where(inArray(ideSegment.parentSegmentId, data.ids));
        await tx.update(ideSegment).set({ deletedAt: sql`now()` }).where(inArray(ideSegment.id, data.ids));
      }),
    );
  });

export const restoreSegments = createServerFn({ method: "POST" })
  .inputValidator((input: { ids: string[] }) => input)
  .handler(async ({ data }): Promise<void> => {
    if (data.ids.length === 0) return;
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) => db.update(ideSegment).set({ deletedAt: null }).where(inArray(ideSegment.id, data.ids)));
  });

type PartRow = typeof ideSegment.$inferSelect;

const mergedInfo = (parts: PartRow[]) => parts.map((p) => ({ id: p.id, name: p.name, type: p.type, classification: p.classification, length: p.length }));

function joinGeometry(parts: PartRow[]): SegmentGeometry {
  return { type: "MultiLineString", coordinates: parts.flatMap((p) => geometrySchema.parse(p.geometry).coordinates) };
}

const totalKm = (parts: PartRow[]) => Number(parts.reduce((sum, p) => sum + p.length, 0).toFixed(4));

export type MergeInput = { ids: string[]; name: string; type: SegmentType; classification: Classification | null };

// Gathers segments under one parent. Merged segments in the selection are
// opened up: their parts, not the old parents, go under the new one; the first
// old parent is kept as the new one so its id stays valid.
export const mergeSegments = createServerFn({ method: "POST" })
  .inputValidator((input: MergeInput) => input)
  .handler(async ({ data }): Promise<void> => {
    const name = data.name.trim();
    if (!name) throw new Error("O nome do trecho mesclado é obrigatório.");
    if (!isSegmentType(data.type)) throw new Error(`Tipologia desconhecida: ${data.type}`);
    if (data.ids.length < 2) throw new Error("Selecione ao menos 2 segmentos para mesclar.");

    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db.transaction(async (tx) => {
        const selected = await tx
          .select()
          .from(ideSegment)
          .where(and(inArray(ideSegment.id, data.ids), isNull(ideSegment.deletedAt)));
        if (selected.length < 2) throw new Error("Os segmentos selecionados não existem mais.");
        const [first] = selected;
        if (!first || selected.some((s) => s.cityId !== first.cityId)) throw new Error("Só é possível mesclar segmentos da mesma cidade.");

        const parents = selected.filter((s) => s.isMerged);
        const loose = selected.filter((s) => !s.isMerged);
        const children =
          parents.length > 0
            ? await tx
                .select()
                .from(ideSegment)
                .where(
                  inArray(
                    ideSegment.parentSegmentId,
                    parents.map((p) => p.id),
                  ),
                )
            : [];
        const parts = [...new Map([...loose, ...children].map((p) => [p.id, p])).values()];

        const target = parents[0];
        const fields = {
          name,
          type: data.type,
          classification: data.classification,
          length: totalKm(parts),
          geometry: joinGeometry(parts),
          isMerged: true,
          mergedSegments: mergedInfo(parts),
        };
        const parentId = target?.id ?? `${first.cityId}_merged-${crypto.randomUUID()}`;
        if (target) {
          await tx.update(ideSegment).set({ ...fields, updatedAt: sql`now()` }).where(eq(ideSegment.id, target.id));
        } else {
          await tx.insert(ideSegment).values({ id: parentId, cityId: first.cityId, neighborhood: first.neighborhood, ...fields });
        }

        await tx
          .update(ideSegment)
          .set({ parentSegmentId: parentId, isMerged: false, selected: false })
          .where(
            inArray(
              ideSegment.id,
              parts.map((p) => p.id),
            ),
          );

        const redundant = parents.slice(1).map((p) => p.id);
        if (redundant.length > 0) await tx.delete(ideSegment).where(inArray(ideSegment.id, redundant));
      }),
    );
  });

// Takes parts out of a merged segment. The parent keeps what is left (its
// length and geometry follow) and goes away when nothing is left.
export const unmergeSegments = createServerFn({ method: "POST" })
  .inputValidator((input: { parentId: string; childIds: string[] }) => input)
  .handler(async ({ data }): Promise<void> => {
    if (data.childIds.length === 0) return;
    const { withDb } = await import("~/lib/db.server");
    await withDb((db) =>
      db.transaction(async (tx) => {
        await tx
          .update(ideSegment)
          .set({ parentSegmentId: null, isMerged: false })
          .where(and(eq(ideSegment.parentSegmentId, data.parentId), inArray(ideSegment.id, data.childIds)));
        const remaining = await tx.select().from(ideSegment).where(eq(ideSegment.parentSegmentId, data.parentId));
        if (remaining.length === 0) {
          await tx.delete(ideSegment).where(eq(ideSegment.id, data.parentId));
          return;
        }
        await tx
          .update(ideSegment)
          .set({ length: totalKm(remaining), geometry: joinGeometry(remaining), mergedSegments: mergedInfo(remaining), updatedAt: sql`now()` })
          .where(eq(ideSegment.id, data.parentId));
      }),
    );
  });

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const assessmentQueryKey = ["assessment"];

export const statesQueryOptions = () => queryOptions({ queryKey: ["assessment", "states"], queryFn: () => listStates(), staleTime: Number.POSITIVE_INFINITY });
export const ibgeCitiesQueryOptions = (stateId: number) =>
  queryOptions({ queryKey: ["assessment", "ibge-cities", stateId], queryFn: () => listIbgeCities({ data: { stateId } }), staleTime: Number.POSITIVE_INFINITY });
export const storedCitiesQueryOptions = () => queryOptions({ queryKey: ["assessment", "cities"], queryFn: () => listStoredCities() });
export const workspaceQueryOptions = (cityId: string) =>
  queryOptions({ queryKey: ["assessment", "workspace", cityId], queryFn: () => getWorkspace({ data: { cityId } }) });
export const segmentDetailQueryOptions = (id: string) =>
  queryOptions({ queryKey: ["assessment", "segment", id], queryFn: () => getSegmentDetail({ data: { id } }) });
