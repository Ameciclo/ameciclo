import { z } from "zod";
import { TOPOLOGY_DIRECTIONS } from "~/components/Admin/topology/types";
import { CHARACTERISTICS } from "~/admin/contagens/schema/contagem-data";

/**
 * Form-side Zod schema for the Nova Contagem form. Holds form state directly.
 * Numeric inputs are kept as strings so empty fields render naturally; we
 * coerce to ints only when submitting to the server fn.
 *
 * `characteristics` keys are the canonical leaves from CHARACTERISTICS in
 * contagem-data.ts (rollups like Caronas / Cargueiras / Serviços / Contramãos
 * are derived for display, not entered).
 */
export const CHARACTERISTIC_KEYS = Object.keys(CHARACTERISTICS) as Array<keyof typeof CHARACTERISTICS>;
export type CharacteristicKey = (typeof CHARACTERISTIC_KEYS)[number];

const OutroRow = z.object({
  label: z.string().trim().default(""),
  count: z.string().default(""),
});
export type OutroRow = z.infer<typeof OutroRow>;

export const NovaFormSchema = z
  .object({
    locationMode: z.enum(["existing", "new"]),
    existingLocationId: z.union([z.number(), z.string(), z.null()]).default(null),
    locationName: z.string().trim().min(1, "Informe o nome do local."),
    topology: z.enum(["point", "t_junction", "crossroad"]),
    approaches: z.array(z.string()),
    movements: z.record(z.string(), z.string()),
    date: z.string().min(1, "Informe a data."),
    startTime: z.string().min(1, "Informe o início."),
    endTime: z.string().min(1, "Informe o término."),
    maxHourCyclists: z.string().default(""),
    weatherConditions: z.string().default(""),
    notes: z.string().default(""),
    // Canonical leaves only — record string→string for the input layer.
    characteristics: z.record(z.string(), z.string()).default({}),
    // Per-session ad-hoc observations (the xlsx "Outros" rows).
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
    // Total > 0 from movements
    let total = 0;
    for (const val of Object.values(v.movements)) {
      const n = Number(val);
      if (Number.isFinite(n) && n > 0) total += n;
    }
    if (total === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["movements"],
        message: "A matriz precisa ter ao menos um movimento contado.",
      });
    }
    // Outros rows must have a label if a count is entered (and vice-versa).
    v.outros.forEach((row, i) => {
      const hasLabel = row.label.trim().length > 0;
      const hasCount = Number(row.count) > 0;
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
          path: ["outros", i, "count"],
          message: "Informe a contagem.",
        });
      }
    });
  });

export type NovaFormValues = z.infer<typeof NovaFormSchema>;

/** Display grouping of canonical characteristic keys for the form. Order matters. */
export const CHARACTERISTIC_GROUPS: Array<{
  group: string;
  label: string;
  /** Optional rollup label shown as a derived total under the group. */
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

/** Returns the leaf characteristic keys belonging to a given group, in
 * insertion order from CHARACTERISTICS. */
export function characteristicsInGroup(group: string): string[] {
  return Object.entries(CHARACTERISTICS)
    .filter(([, meta]) => meta.group === group)
    .map(([key]) => key);
}
