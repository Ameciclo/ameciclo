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

      const [movements, observations, dictionary] = await Promise.all([
        db.query.movementCount.findMany({ where: { contagemId: data.id } }),
        db.query.observation.findMany({
          where: { contagemId: data.id },
          orderBy: { block: "asc", position: "asc", bucket: "asc" },
        }),
        db.query.characteristic.findMany(),
      ]);
      return { row, movements, observations, dictionary };
    });
  });
