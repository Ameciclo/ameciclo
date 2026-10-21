import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import {
  characteristic,
  characteristicAlias,
  contagem,
  importWarning,
  local,
  observation,
} from "@ameciclo/db/schema";
import type { ContagemDocument } from "@ameciclo/db/document";

export const listContagens = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb((db) =>
    db
      .select({
        id: contagem.id,
        date: contagem.date,
        variant: contagem.variant,
        topology: contagem.topology,
        isProjected: contagem.isProjected,
        isPartial: sql<boolean>`(${contagem.observedBuckets} is not null and not ${contagem.isProjected})`,
        totalCyclists: contagem.totalCyclists,
        peakBucketCount: contagem.peakBucketCount,
        localId: local.id,
        localName: local.name,
        warnings: sql<number>`(select count(*)::int from ${importWarning} w where w.contagem_id = ${contagem.id} and w.severity <> 'info')`,
      })
      .from(contagem)
      .innerJoin(local, eq(local.id, contagem.localId))
      .orderBy(desc(contagem.date), local.name),
  );
});

export const listLocals = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb((db) =>
    db
      .select({
        id: local.id,
        name: local.name,
        slug: local.slug,
        latitude: local.latitude,
        longitude: local.longitude,
        contagens: sql<number>`count(${contagem.id})::int`,
        firstDate: sql<string | null>`min(${contagem.date})`,
        lastDate: sql<string | null>`max(${contagem.date})`,
        totalCyclists: sql<number>`coalesce(sum(${contagem.totalCyclists}), 0)::int`,
      })
      .from(local)
      .leftJoin(contagem, eq(contagem.localId, local.id))
      .groupBy(local.id)
      .orderBy(local.name),
  );
});

export const listCharacteristics = createServerFn({ method: "GET" }).handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(async (db) => {
    const dictionary = await db
      .select({
        key: characteristic.key,
        label: characteristic.label,
        group: characteristic.group,
        parentKey: characteristic.parentKey,
        isRollup: characteristic.isRollup,
        contagens: sql<number>`count(distinct ${observation.contagemId})::int`,
        aliases: sql<string[]>`coalesce((select array_agg(a.alias order by a.alias) from ${characteristicAlias} a where a.characteristic_key = ${characteristic.key}), '{}')`,
      })
      .from(characteristic)
      .leftJoin(observation, eq(observation.characteristicKey, characteristic.key))
      .groupBy(characteristic.key)
      .orderBy(characteristic.group, characteristic.key);

    const unmapped = await db
      .select({
        rawLabel: observation.rawLabel,
        rows: sql<number>`count(*)::int`,
        contagens: sql<number>`count(distinct ${observation.contagemId})::int`,
      })
      .from(observation)
      .where(sql`${observation.characteristicKey} is null`)
      .groupBy(observation.rawLabel)
      .orderBy(sql`count(*) desc`);

    return { dictionary, unmapped };
  });
});

export const getContagem = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const row = await db.query.contagem.findFirst({
        where: { id: data.id },
        with: { local: true, annotations: true, conditions: true, warnings: true },
      });
      if (!row) return null;

      const movements = await db.query.movementCount.findMany({ where: { contagemId: data.id } });
      const observations = await db.query.observation.findMany({
        where: { contagemId: data.id },
        orderBy: { block: "asc", position: "asc", bucket: "asc" },
      });
      const dictionary = await db.query.characteristic.findMany();
      return { row, movements, observations, dictionary };
    });
  });

export const getDocument = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadDocument } = await import("@ameciclo/db");
    return withDb((db) => loadDocument(db, data.id));
  });

export const listRevisions = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { listRevisions } = await import("@ameciclo/db");
    return withDb((db) => listRevisions(db, data.id));
  });

type SaveResult =
  | { ok: true; changed: boolean; version: number; changeCount: number }
  | { ok: false; code: "conflict"; currentVersion: number; lastAuthor: string | null }
  | { ok: false; code: "invalid"; problems: string[] };

async function guarded(work: () => Promise<{ changed: boolean; version: number; changeCount: number }>): Promise<SaveResult> {
  const { VersionConflictError, InvalidDocumentError } = await import("@ameciclo/db");
  try {
    return { ok: true, ...(await work()) };
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return { ok: false, code: "conflict", currentVersion: error.currentVersion, lastAuthor: error.lastAuthor };
    }
    if (error instanceof InvalidDocumentError) return { ok: false, code: "invalid", problems: error.problems };
    throw error;
  }
}

export const saveContagem = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: number; expectedVersion: number; doc: ContagemDocument; reason: string | null }) => input,
  )
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { currentAuthor } = await import("~/lib/author.server");
    const { saveDocument } = await import("@ameciclo/db");
    return guarded(() => withDb((db) => saveDocument(db, { ...data, author: currentAuthor() })));
  });

export const revertContagem = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: number; toVersion: number; expectedVersion: number; reason: string | null }) => input,
  )
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { currentAuthor } = await import("~/lib/author.server");
    const { revertToVersion } = await import("@ameciclo/db");
    return guarded(() => withDb((db) => revertToVersion(db, { ...data, author: currentAuthor() })));
  });

export const contagensQueryOptions = () => queryOptions({ queryKey: ["contagens"], queryFn: () => listContagens() });
export const localsQueryOptions = () => queryOptions({ queryKey: ["locals"], queryFn: () => listLocals() });
export const characteristicsQueryOptions = () =>
  queryOptions({ queryKey: ["characteristics"], queryFn: () => listCharacteristics() });
export const contagemQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["contagem", id], queryFn: () => getContagem({ data: { id } }) });
export const documentQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["document", id], queryFn: () => getDocument({ data: { id } }) });
export const revisionsQueryOptions = (id: number) =>
  queryOptions({ queryKey: ["revisions", id], queryFn: () => listRevisions({ data: { id } }) });

// Everything a save can change, for a given contagem.
export const contagemQueryKeys = (id: number) => [
  ["contagem", id],
  ["document", id],
  ["revisions", id],
  ["contagens"],
  ["locals"],
  ["characteristics"],
];
