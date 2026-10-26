import { z } from "zod";

// What the refinement step learns about a segment beyond name, type and
// hierarchy: the OpenStreetMap tags, the values read from them (the prefill of
// the IDECICLO form) and how much to trust each. It lives in the segment's
// osm_advanced jsonb column; the keys are the ones the original site wrote, so
// data imported from it reads the same.

export const confidenceSchema = z.enum(["high", "medium", "low", "unknown"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const prefillSchema = z.object({
  nome: z.string().optional(),
  trechoInicio: z.string().optional(),
  trechoFim: z.string().optional(),
  tipologia: z.string().optional(),
  posicaoNaVia: z.string().optional(),
  hierarquia: z.string().optional(),
  velocidade: z.string().optional(),
  sentido: z.string().optional(),
  numeroFaixas: z.number().optional(),
  pavimento: z.string().optional(),
  largura: z.number().optional(),
  bufferSeparacao: z.string().optional(),
  pendenciasCampo: z.array(z.string()).default([]),
});
export type Prefill = z.infer<typeof prefillSchema>;

export const suggestionSchema = z.object({
  field: z.string(),
  reason: z.string(),
  suggestedTags: z.array(z.string()),
  priority: z.enum(["high", "medium", "low"]),
});
export type Suggestion = z.infer<typeof suggestionSchema>;

export const intersectionPreviewSchema = z.object({
  pointKey: z.string(),
  roadId: z.string(),
  roadName: z.string().optional(),
  highway: z.string().optional(),
  hierarchy: z.string().optional(),
  hasCyclingInfrastructure: z.boolean().nullish(),
  cyclingInfrastructureType: z.string().optional(),
});
export type IntersectionPreview = z.infer<typeof intersectionPreviewSchema>;

export const technicalSchema = z.object({
  version: z.number().optional(),
  updated_at: z.string().optional(),
  osm_id: z.string().optional(),
  osm_type: z.string().optional(),
  osm_tags: z.record(z.string(), z.string()).optional(),
  osm_confidence: z.record(z.string(), confidenceSchema).optional(),
  ideciclo_prefill: prefillSchema.optional(),
  osm_improvement_suggestions: z.array(suggestionSchema).optional(),
  intersections_preview: z.array(intersectionPreviewSchema).optional(),
  estimated_blocks_count: z.number().nullish(),
  estimated_intersections_count: z.number().nullish(),
  blocks_count: z.number().nullish(),
  intersections_count: z.number().nullish(),
  relevant_intersections_count: z.number().nullish(),
  connected_intersections_count: z.number().nullish(),
});
export type Technical = z.infer<typeof technicalSchema>;

/** The osm_advanced column, which is null until someone fills it in. */
export function parseTechnical(value: unknown): Technical | null {
  return value === null || value === undefined ? null : technicalSchema.parse(value);
}

/** The column as stored, to merge a patch into it without dropping keys this app does not read. */
export function rawEnvelope(value: unknown): Record<string, unknown> {
  return value === null || value === undefined ? {} : z.record(z.string(), z.unknown()).parse(value);
}
