import { z } from "zod";
import { TOPOLOGY_DIRECTIONS } from "~/components/Admin/topology/types";

/**
 * Form-side Zod schema for the Nova Contagem form. Holds RHF state directly.
 * Numeric inputs are kept as strings so empty fields render naturally; we
 * coerce to ints only when submitting to the server fn.
 */
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
    characteristics: z.record(z.string(), z.string()).default({}),
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
  });

export type NovaFormValues = z.infer<typeof NovaFormSchema>;

/** All canonical characteristic keys we render fields for. */
export const CHARACTERISTIC_KEYS = [
  "women",
  "juveniles",
  "ride",
  "helmet",
  "wrong_way",
  "sidewalk",
  "service",
  "cargo",
  "shared_bike",
  "motor",
  "other_active_modes",
  "rain",
  "other_behaviors",
  "others",
] as const;
export type CharacteristicKey = (typeof CHARACTERISTIC_KEYS)[number];
