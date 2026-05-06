import { z } from "zod";

/**
 * Zod schemas for the `contagem.data` JSON column. Dialect-independent —
 * survives the SQLite → Postgres swap untouched.
 *
 * Each variant carries a `schema` discriminator. Code dispatches on it via
 * the discriminated union at the bottom; readers always go through
 * `parseContagemData()` so old rows can be lazily upgraded if/when we add
 * a v2.
 */

const NonNegInt = z.number().int().nonnegative();

const HourlyBucketsArray = z.array(NonNegInt);

/** "fromIdx-toIdx", e.g. "0-2". Excludes self-loops. */
const MovementKey = z
  .string()
  .regex(/^\d+-\d+$/, "movement key must look like '<from>-<to>'")
  .refine(
    (k) => {
      const [a, b] = k.split("-");
      return a !== b;
    },
    { message: "U-turns (from === to) are not stored" },
  );

const Outros = z.object({
  label: z.string().min(1),
  buckets: HourlyBucketsArray,
});

const BucketNote = z.object({
  fromBucket: z.number().int().nonnegative(),
  toBucket: z.number().int().nonnegative(),
  note: z.string().min(1),
});

const Totals = z.object({
  cyclists: NonNegInt,
  peakBucketCount: NonNegInt,
});

/* ----- ameciclo.v1 ------------------------------------------------------ */

export const AmecicloV1 = z
  .object({
    schema: z.literal("ameciclo.v1"),

    // Ordered approach labels, snapshotted on the contagem so renaming a
    // place later doesn't rewrite history. Length matches topology
    // (point=2, t_junction=3, crossroad=4).
    approaches: z.array(z.string().min(1)).min(2).max(8),

    // Quantitativo: per-movement hourly arrays. Each value array has
    // length === parent contagem's bucketCount.
    movements: z.record(MovementKey, HourlyBucketsArray),

    // Qualitativo (canonical taxonomy keys; rollups derived at read).
    characteristics: z.record(z.string().min(1), HourlyBucketsArray),

    // Per-session ad-hoc rows ("Outros - corte de caminho pela calçada…").
    outros: z.array(Outros).default([]),

    // Per-bucket-range narrative ("choveu fraco das 10h às 11h").
    bucketNotes: z.array(BucketNote).default([]),

    // Materialized aggregates. Written by the producer (form / importer) so
    // generated columns can pull from a stable path.
    totals: Totals,
  })
  .strict();

export type AmecicloV1Data = z.infer<typeof AmecicloV1>;

/* ----- discriminated union ---------------------------------------------- */

export const ContagemData = z.discriminatedUnion("schema", [
  AmecicloV1,
  // Future variants (e.g. external.parana.2024, ameciclo.v2) plug in here.
]);

export type ContagemData = z.infer<typeof ContagemData>;

/* ----- canonical characteristic taxonomy -------------------------------- */

/** Static seed of recognized characteristic keys + their parents (for rollups).
 *  Adding a new key here is a non-breaking change — old data simply has no
 *  bucket vector for that key. */
export const CHARACTERISTICS: Record<
  string,
  { label: string; group: string; parent?: string }
> = {
  // profile
  women: { label: "Mulher", group: "profile" },
  juveniles: { label: "Crianças e adolescentes", group: "profile" },

  // behavior
  helmet: { label: "Capacete", group: "behavior" },
  sidewalk: { label: "Calçada", group: "behavior" },
  mascara: { label: "Máscara", group: "behavior" },

  // carona (rolls up to "caronas")
  carona_crianca: { label: "Carona criança", group: "carona", parent: "caronas" },
  carona_mulher: { label: "Carona mulher", group: "carona", parent: "caronas" },
  carona_homem: { label: "Carona homem", group: "carona", parent: "caronas" },

  // cargueira (rolls up to "cargueiras")
  cargueira_tradicional: {
    label: "Cargueira tradicional",
    group: "cargueira",
    parent: "cargueiras",
  },
  cargueira_adaptada: {
    label: "Adaptada a carga",
    group: "cargueira",
    parent: "cargueiras",
  },

  // serviço (rolls up to "servicos")
  servico: { label: "Serviço", group: "servico", parent: "servicos" },
  servico_app: { label: "Serviço APP", group: "servico", parent: "servicos" },

  // contramão (rolls up to "contramaos")
  contramao: { label: "Contramão", group: "contramao", parent: "contramaos" },
  contramao_para_conversao: {
    label: "Contramão para conversão",
    group: "contramao",
    parent: "contramaos",
  },

  // modal / programa (no rollups — all leaves)
  bike_pe: { label: "Bike PE", group: "program" },
  empurrando: { label: "Empurrando", group: "modal" },
  triciclo: { label: "Triciclo", group: "modal" },
  carroca: { label: "Carroça", group: "modal" },
  eletrica: { label: "Elétrica", group: "modal" },
  motorizada: { label: "Motorizada", group: "modal" },
  ciclomotor: { label: "Ciclomotor", group: "modal" },
  skate_patinaveis: { label: "Skate e outros patináveis", group: "modal" },
  cadeirante: { label: "Cadeirante", group: "modal" },
  handbike: { label: "Handbike", group: "modal" },
  grupos_pedal: { label: "Grupos de Pedal", group: "program" },
  faixa_azul: { label: "Faixa Azul", group: "program" },
};

/* ----- parse / migrate / build ----------------------------------------- */

export function parseContagemData(raw: unknown): ContagemData {
  return ContagemData.parse(raw);
}

/** Sums every value in every bucket array. */
function sumAll(map: Record<string, number[]>): number {
  let total = 0;
  for (const arr of Object.values(map)) {
    for (const v of arr) total += v;
  }
  return total;
}

/** Highest single-bucket sum across all movements. */
function peakBucket(movements: Record<string, number[]>, bucketCount: number): number {
  let peak = 0;
  for (let i = 0; i < bucketCount; i++) {
    let s = 0;
    for (const arr of Object.values(movements)) s += arr[i] ?? 0;
    if (s > peak) peak = s;
  }
  return peak;
}

/**
 * Compute `totals` from the rest of the payload. Producers (form, importer)
 * call this before writing so the generated columns and JSON agree.
 */
export function computeTotals(input: {
  movements: Record<string, number[]>;
  bucketCount: number;
}): { cyclists: number; peakBucketCount: number } {
  return {
    cyclists: sumAll(input.movements),
    peakBucketCount: peakBucket(input.movements, input.bucketCount),
  };
}
