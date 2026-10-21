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

export type PublicSeries = { name: string; data: number[]; visible?: boolean };

export type PublicCountDetail = {
  id: number;
  date: string;
  approaches: string[];
  topology: "point" | "t_junction" | "crossroad";
  hours: number[];
  series: PublicSeries[];
  flows: { from: number; to: number; value: number }[];
  estimated: boolean;
  // Hours with real counts when the count is partial or projected; null when all hours were counted.
  observedHours: number[] | null;
  partial: boolean;
};

const SERIES_LABELS = [
  ["women", "Mulheres"],
  ["juveniles", "Crianças e Adolescentes"],
  ["ride", "Carona"],
  ["helmet", "Capacete"],
  ["service", "Serviço"],
  ["cargo", "Cargueira"],
  ["shared_bike", "Compartilhada"],
  ["sidewalk", "Calçada"],
  ["wrong_way", "Contramão"],
] as const;

// Hourly movements and characteristics of one published contagem, for the
// flow diagram and the hourly chart.
export async function loadPublicCountDetail(db: Db, contagemId: number): Promise<PublicCountDetail | null> {
  const row = await db.query.contagem.findFirst({ where: { id: contagemId, status: "published" } });
  if (!row) return null;

  const basis = row.isProjected ? "projected" : "observed";
  const movements = await db.query.movementCount.findMany({ where: { contagemId, basis } });
  const observations = await db.query.observation.findMany({
    where: { contagemId, basis: "observed", characteristicKey: { in: [...ALL_KEYS] } },
  });

  const startHour = Number.parseInt(row.startedAt ?? "6", 10);
  const declared = Math.round(
    ((Number.parseInt(row.endedAt ?? "20", 10) - startHour) * 60) / row.bucketMinutes,
  );
  const bucketCount = Math.max(declared, ...movements.map((m) => (m.bucket ?? -1) + 1));
  const zeros = () => Array.from<number>({ length: bucketCount }).fill(0);
  const hours = Array.from({ length: bucketCount }, (_, i) => startHour + (i * row.bucketMinutes) / 60);

  const total = zeros();
  const flowMap = new Map<string, number>();
  for (const m of movements) {
    if (m.bucket !== null) total[m.bucket] += m.value;
    const key = `${m.fromIdx}-${m.toIdx}`;
    flowMap.set(key, (flowMap.get(key) ?? 0) + m.value);
  }

  const perKey = new Map<string, number[]>();
  for (const o of observations) {
    if (o.characteristicKey === null || o.bucket === null) continue;
    const arr = perKey.get(o.characteristicKey) ?? zeros();
    arr[o.bucket] += o.value;
    perKey.set(o.characteristicKey, arr);
  }
  const hourly = (keys: readonly string[]) =>
    keys.reduce((acc, k) => acc.map((v, i) => v + (perKey.get(k)?.[i] ?? 0)), zeros());
  const hourlyRollup = (r: { total: string; parts: readonly string[] }) =>
    perKey.has(r.total) ? hourly([r.total]) : hourly(r.parts);

  const byName: Record<string, number[]> = {
    women: hourly([DIRECT.women]),
    juveniles: hourly([DIRECT.juveniles]),
    helmet: hourly([DIRECT.helmet]),
    sidewalk: hourly([DIRECT.sidewalk]),
    shared_bike: hourly([DIRECT.shared_bike]),
    ride: hourlyRollup(ROLLUPS.ride),
    cargo: hourlyRollup(ROLLUPS.cargo),
    service: hourlyRollup(ROLLUPS.service),
    wrong_way: hourlyRollup(ROLLUPS.wrong_way),
  };

  const series: PublicSeries[] = [
    { name: "Total", data: total },
    ...SERIES_LABELS.map(([key, name]): PublicSeries => ({ name, data: byName[key], visible: false })),
  ];

  const partial = !row.isProjected && row.observedBuckets !== null;
  return {
    id: row.id,
    date: row.date,
    approaches: row.approaches,
    topology: row.topology,
    hours,
    series,
    flows: [...flowMap.entries()].map(([key, value]) => {
      const [from, to] = key.split("-").map(Number);
      return { from, to, value };
    }),
    estimated: row.isProjected,
    observedHours: row.observedBuckets ? row.observedBuckets.map((b) => hours[b]) : null,
    partial,
  };
}
