import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "~/db/client";
import { contagem } from "~/db/schema";
import {
  AmecicloV1,
  computeTotals,
  type AmecicloV1Data,
} from "~/admin/contagens/schema/contagem-data";

/**
 * Form-side input shape. Mirrors the column split: the things that live in
 * proper columns travel as top-level fields, the rest is the (validated)
 * `data` payload.
 */
const Input = z.object({
  localName: z.string().trim().min(1, "Informe o nome do local."),
  startedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/,
      "Use ISO sem fuso (ex: 2024-06-06T06:00).",
    ),
  timezone: z.string().default("America/Recife"),
  bucketMinutes: z.number().int().positive(),
  bucketCount: z.number().int().positive(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  topology: z.enum(["point", "t_junction", "crossroad"]),
  notes: z.string().nullable().optional(),
  // The variant payload — strict-validated against the schema discriminator.
  data: AmecicloV1.omit({ totals: true, schema: true }),
});

export type CreateContagemInput = z.input<typeof Input>;

export const createContagem = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data: input }) => {
    const totals = computeTotals({
      movements: input.data.movements,
      bucketCount: input.bucketCount,
    });

    const dataPayload: AmecicloV1Data = {
      schema: "ameciclo.v1",
      ...input.data,
      totals,
    };

    const [row] = await db()
      .insert(contagem)
      .values({
        localName: input.localName,
        startedAt: input.startedAt,
        timezone: input.timezone,
        bucketMinutes: input.bucketMinutes,
        bucketCount: input.bucketCount,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        topology: input.topology,
        notes: input.notes ?? null,
        schema: "ameciclo.v1",
        data: dataPayload,
      })
      .returning({ id: contagem.id });

    return { id: row.id, totals };
  });
