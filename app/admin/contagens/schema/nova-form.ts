import { z } from "zod";
import { TOPOLOGY_DIRECTIONS } from "~/components/Admin/topology/types";
import { CHARACTERISTICS } from "~/admin/contagens/schema/contagem-data";

/**
 * Form-side Zod schema for the Nova Contagem form. Holds form state directly.
 *
 * Per-bucket data: `movements`, `characteristics` and `outros[].counts` are
 * arrays of strings, one entry per bucket. Length tracks `bucketCount` derived
 * from `startTime`, `endTime` and `bucketMinutes`. The form renders either
 * totals (sum of the array) or each bucket cell directly depending on the
 * current view mode (UI-only state).
 */
export const CHARACTERISTIC_KEYS = Object.keys(CHARACTERISTICS) as Array<
  keyof typeof CHARACTERISTICS
>;
export type CharacteristicKey = (typeof CHARACTERISTIC_KEYS)[number];

const StringBucketArray = z.array(z.string());

const OutroRow = z.object({
  label: z.string().trim().default(""),
  counts: StringBucketArray.default([]),
});
export type OutroRow = z.infer<typeof OutroRow>;

export const BUCKET_MINUTES_OPTIONS = ["15", "30", "60", "120"] as const;
export type BucketMinutes = (typeof BUCKET_MINUTES_OPTIONS)[number];

export const NovaFormSchema = z
  .object({
    locationMode: z.enum(["existing", "new"]),
    existingLocationId: z.union([z.number(), z.string(), z.null()]).default(null),
    locationName: z.string().trim().min(1, "Informe o nome do local."),
    topology: z.enum(["point", "t_junction", "crossroad"]),
    approaches: z.array(z.string()),
    movements: z.record(z.string(), StringBucketArray),
    date: z.string().min(1, "Informe a data."),
    startTime: z.string().min(1, "Informe o início."),
    endTime: z.string().min(1, "Informe o término."),
    bucketMinutes: z.enum(BUCKET_MINUTES_OPTIONS).default("60"),
    maxHourCyclists: z.string().default(""),
    weatherConditions: z.string().default(""),
    notes: z.string().default(""),
    characteristics: z.record(z.string(), StringBucketArray).default({}),
    outros: z.array(OutroRow).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.locationMode === "existing" && v.existingLocationId == null) {
      ctx.addIssue({
        code: "custom",
        path: ["existingLocationId"],
        message: "Selecione um ponto da lista.",
      });
    }
    if (v.startTime && v.endTime && v.endTime <= v.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Deve ser depois do início.",
      });
    }
    const expectedApproaches = TOPOLOGY_DIRECTIONS[v.topology].length;
    if (v.approaches.length !== expectedApproaches) {
      ctx.addIssue({
        code: "custom",
        path: ["approaches"],
        message: `Esperadas ${expectedApproaches} aproximações para ${v.topology}.`,
      });
    }
    let total = 0;
    for (const arr of Object.values(v.movements)) {
      for (const cell of arr) {
        const n = Number(cell);
        if (Number.isFinite(n) && n > 0) total += n;
      }
    }
    if (total === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["movements"],
        message: "A matriz precisa ter ao menos um movimento contado.",
      });
    }
    v.outros.forEach((row, i) => {
      const hasLabel = row.label.trim().length > 0;
      const hasCount = sumStringArray(row.counts) > 0;
      if (hasCount && !hasLabel) {
        ctx.addIssue({
          code: "custom",
          path: ["outros", i, "label"],
          message: "Descreva a observação.",
        });
      }
      if (hasLabel && !hasCount) {
        ctx.addIssue({
          code: "custom",
          path: ["outros", i, "counts"],
          message: "Informe ao menos uma contagem.",
        });
      }
    });
  });

export type NovaFormValues = z.infer<typeof NovaFormSchema>;

/* ---------- helpers ---------------------------------------------------- */

export function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Number of buckets covered by [startTime, endTime) at bucketMinutes width.
 * Returns 0 when times are missing/invalid. */
export function deriveBucketCount(
  startTime: string,
  endTime: string,
  bucketMinutes: BucketMinutes,
): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const width = Number(bucketMinutes);
  if (!start || !end || end <= start || !width) return 0;
  return Math.max(0, Math.floor((end - start) / width));
}

/** Sum of numbers in a string array (NaN/"" treated as 0). */
export function sumStringArray(arr: string[] | undefined): number {
  if (!arr) return 0;
  let s = 0;
  for (const v of arr) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) s += Math.trunc(n);
  }
  return s;
}

/** Build an array of length n filled with "". */
export function emptyBucketArray(n: number): string[] {
  return Array.from({ length: Math.max(0, n) }, () => "");
}

/** Read a string-array bucket cell with safe fallback. */
export function readCell(arr: string[] | undefined, idx: number): string {
  return arr?.[idx] ?? "";
}

/** Returns a copy of `arr` resized to `n`, padding with "" or truncating. */
export function resizeBucketArray(arr: string[] | undefined, n: number): string[] {
  const out = emptyBucketArray(n);
  if (!arr) return out;
  for (let i = 0; i < Math.min(arr.length, n); i++) out[i] = arr[i];
  return out;
}

/* ---------- characteristic taxonomy display --------------------------- */

export const CHARACTERISTIC_GROUPS: Array<{
  group: string;
  label: string;
  rolledUpAs?: string;
}> = [
  { group: "profile", label: "Perfil" },
  { group: "behavior", label: "Comportamento" },
  { group: "carona", label: "Carona", rolledUpAs: "Caronas" },
  { group: "cargueira", label: "Cargueira", rolledUpAs: "Cargueiras" },
  { group: "servico", label: "Serviço", rolledUpAs: "Serviços" },
  { group: "contramao", label: "Contramão", rolledUpAs: "Contramãos" },
  { group: "modal", label: "Modal" },
  { group: "program", label: "Programa" },
];

export function characteristicsInGroup(group: string): string[] {
  return Object.entries(CHARACTERISTICS)
    .filter(([, meta]) => meta.group === group)
    .map(([key]) => key);
}
