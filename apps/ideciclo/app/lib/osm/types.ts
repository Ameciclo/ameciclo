import { z } from "zod";

// Overpass answers. Validated where they come in, so the rest of the code can
// trust the shape instead of guarding every field.
const pointSchema = z.object({ lat: z.number(), lon: z.number() });

export const overpassElementSchema = z.object({
  type: z.string(),
  id: z.number(),
  nodes: z.array(z.number()).optional(),
  geometry: z.array(pointSchema).optional(),
  tags: z.record(z.string(), z.string()).default({}),
});

export const overpassResponseSchema = z.object({ elements: z.array(overpassElementSchema) });

export type OverpassElement = z.infer<typeof overpassElementSchema>;
export type OverpassResponse = z.infer<typeof overpassResponseSchema>;

export const SEGMENT_TYPES = ["Ciclofaixa", "Ciclovia", "Ciclorrota", "Compartilhada"] as const;
export type SegmentType = (typeof SEGMENT_TYPES)[number];

export function isSegmentType(value: string): value is SegmentType {
  return SEGMENT_TYPES.some((type) => type === value);
}

// Hierarquia da via: how fast and how busy the road beside the structure is.
export const CLASSIFICATIONS = ["estrutural", "alimentadora", "local"] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  estrutural: "Estrutural",
  alimentadora: "Alimentadora",
  local: "Local",
};

export function isClassification(value: string): value is Classification {
  return CLASSIFICATIONS.some((c) => c === value);
}

export const IBGE_STATE_SCHEMA = z.array(z.object({ id: z.number(), sigla: z.string(), nome: z.string() }));
export const IBGE_CITY_SCHEMA = z.array(z.object({ id: z.number(), nome: z.string() }));
export type IbgeState = z.infer<typeof IBGE_STATE_SCHEMA>[number];
export type IbgeCity = z.infer<typeof IBGE_CITY_SCHEMA>[number];

// MultiLineString written by the downloader; merging concatenates the lines.
export const geometrySchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(z.array(z.array(z.number()))),
});
export type SegmentGeometry = z.infer<typeof geometrySchema>;
