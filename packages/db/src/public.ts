import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { relations } from "./relations";
import { contagem, local, observation } from "./schema";

type Db = NodePgDatabase<typeof relations>;

export type PublicCharacteristics = {
  women: number;
  juveniles: number;
  ride: number;
  helmet: number;
  service: number;
  cargo: number;
  shared_bike: number;
  sidewalk: number;
  wrong_way: number;
  motor: number;
};

export type PublicCount = {
  id: number;
  date: string;
  variant: string | null;
  total_cyclists: number;
  max_hour_cyclists: number;
  // True when the total is a projection of a peak-hour count.
  estimated: boolean;
  // True when only some hours were counted and nothing was projected.
  partial: boolean;
  characteristics: PublicCharacteristics;
};

// Same shape the site used to read from the Atlas API, so pages need no changes.
export type PublicLocation = {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  counts: PublicCount[];
};

// The spreadsheet's own total row wins when it exists, because that is the number
// that was always published; the nested rows are the fallback.
const ROLLUPS = {
  ride: { total: "caronas", parts: ["carona_crianca", "carona_mulher", "carona_homem"] },
  cargo: { total: "cargueiras", parts: ["cargueira_tradicional", "cargueira_adaptada"] },
  service: { total: "servicos", parts: ["servico", "servico_app"] },
  wrong_way: { total: "contramaos", parts: ["contramao", "contramao_conversao", "contramao_ciclofaixa"] },
} as const;

const DIRECT = {
  women: "women",
  juveniles: "juveniles",
  helmet: "helmet",
  sidewalk: "sidewalk",
  shared_bike: "bike_pe",
} as const;

const MOTOR_KEYS = ["motorizada", "ciclomotor", "motorizada_ou_eletrica"];

const ALL_KEYS = [
  ...Object.values(DIRECT),
  ...Object.values(ROLLUPS).flatMap((r) => [r.total, ...r.parts]),
  ...MOTOR_KEYS,
];

export function characteristicsOf(sums: Map<string, number>): PublicCharacteristics {
  const sum = (keys: readonly string[]) => keys.reduce((s, k) => s + (sums.get(k) ?? 0), 0);
  const rollup = (r: { total: string; parts: readonly string[] }) =>
    sums.has(r.total) ? (sums.get(r.total) ?? 0) : sum(r.parts);
  return {
    women: sums.get(DIRECT.women) ?? 0,
    juveniles: sums.get(DIRECT.juveniles) ?? 0,
    helmet: sums.get(DIRECT.helmet) ?? 0,
    sidewalk: sums.get(DIRECT.sidewalk) ?? 0,
    shared_bike: sums.get(DIRECT.shared_bike) ?? 0,
    ride: rollup(ROLLUPS.ride),
    cargo: rollup(ROLLUPS.cargo),
    service: rollup(ROLLUPS.service),
    wrong_way: rollup(ROLLUPS.wrong_way),
    motor: sum(MOTOR_KEYS),
  };
}

// Published contagens grouped by place, newest count first.
export async function loadPublicLocations(db: Db, options: { localId?: number } = {}): Promise<PublicLocation[]> {
  const rows = await db
    .select({
      localId: local.id,
      name: local.name,
      slug: local.slug,
      latitude: local.latitude,
      longitude: local.longitude,
      id: contagem.id,
      date: contagem.date,
      variant: contagem.variant,
      total: contagem.totalCyclists,
      peak: contagem.peakBucketCount,
      estimated: contagem.isProjected,
      partial: sql<boolean>`(${contagem.observedBuckets} is not null and not ${contagem.isProjected})`,
    })
    .from(contagem)
    .innerJoin(local, eq(local.id, contagem.localId))
    .where(and(eq(contagem.status, "published"), options.localId === undefined ? undefined : eq(local.id, options.localId)))
    .orderBy(desc(contagem.date), local.name);
  if (rows.length === 0) return [];

  const sums = await db
    .select({
      contagemId: observation.contagemId,
      key: observation.characteristicKey,
      total: sql<number>`sum(${observation.value})::int`,
    })
    .from(observation)
    .where(
      and(
        eq(observation.basis, "observed"),
        isNotNull(observation.characteristicKey),
        inArray(observation.characteristicKey, ALL_KEYS),
        inArray(observation.contagemId, rows.map((r) => r.id)),
      ),
    )
    .groupBy(observation.contagemId, observation.characteristicKey);

  const byContagem = new Map<number, Map<string, number>>();
  for (const s of sums) {
    if (s.key === null) continue;
    const map = byContagem.get(s.contagemId) ?? new Map<string, number>();
    map.set(s.key, s.total);
    byContagem.set(s.contagemId, map);
  }

  const locations = new Map<number, PublicLocation>();
  for (const r of rows) {
    const location =
      locations.get(r.localId) ??
      { id: r.localId, name: r.name, slug: r.slug, latitude: r.latitude, longitude: r.longitude, counts: [] };
    location.counts.push({
      id: r.id,
      date: r.date,
      variant: r.variant,
      total_cyclists: r.total ?? 0,
      max_hour_cyclists: r.peak ?? 0,
      estimated: r.estimated,
      partial: r.partial,
      characteristics: characteristicsOf(byContagem.get(r.id) ?? new Map()),
    });
    locations.set(r.localId, location);
  }
  return [...locations.values()];
}
