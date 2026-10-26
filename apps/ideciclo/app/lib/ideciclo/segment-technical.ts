import { z } from "zod";

// What the OpenStreetMap import learned about a segment, kept in the segment's
// `osm_advanced` jsonb as a versioned envelope. Written by the refinement step,
// read here to prefill the evaluation form.

const confidence = z.enum(["high", "medium", "low", "unknown"]);

export const IdecicloPrefillSchema = z.looseObject({
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
export type IdecicloPrefill = z.infer<typeof IdecicloPrefillSchema>;

export const IntersectionSelectionSchema = z.looseObject({
  id: z.string(),
  pointKey: z.string(),
  roadId: z.string(),
  roadName: z.string().optional(),
  highway: z.string().optional(),
  hierarchyOsm: z.string().optional(),
  hierarchyIdeciclo: z.string().optional(),
  hasCyclingInfrastructure: z.boolean().nullable().optional(),
  cyclingInfrastructureType: z.string().optional(),
  selected: z.boolean(),
});
export type IntersectionSelection = z.infer<typeof IntersectionSelectionSchema>;

const count = z.number().nullish();

export const SegmentTechnicalSchema = z.looseObject({
  ideciclo_prefill: IdecicloPrefillSchema.nullish(),
  osm_tags: z.record(z.string(), z.string()).nullish(),
  osm_confidence: z.record(z.string(), confidence).nullish(),
  selected_intersections: z.array(IntersectionSelectionSchema).nullish(),
  blocks_count: count,
  intersections_count: count,
  relevant_intersections_count: count,
  connected_intersections_count: count,
  estimated_blocks_count: count,
  estimated_intersections_count: count,
});
export type SegmentTechnical = z.infer<typeof SegmentTechnicalSchema>;

// Only line geometries are drawn.
const Position = z.tuple([z.number(), z.number()]).rest(z.number());
export const LineGeometrySchema = z.union([
  z.object({ type: z.literal("LineString"), coordinates: z.array(Position) }),
  z.object({ type: z.literal("MultiLineString"), coordinates: z.array(z.array(Position)) }),
]);
export type LineGeometry = z.infer<typeof LineGeometrySchema>;

export const SEGMENT_TYPES = ["Ciclofaixa", "Ciclovia", "Ciclorrota", "Compartilhada"] as const;
export type SegmentType = (typeof SEGMENT_TYPES)[number];

// A segment as the evaluation form needs it. Ids are the ones stored in the
// database. `geometry` is GeoJSON text: server functions only carry serializable types.
export type SegmentContext = {
  id: string;
  cityId: string;
  name: string;
  type: SegmentType;
  length: number;
  neighborhood: string | null;
  geometry: string | null;
  classification: string | null;
  evaluated: boolean;
  formId: string | null;
  // `osm_advanced` as stored; parsed with SegmentTechnicalSchema by the reader.
  technical: string | null;
};

export const parseSegmentTechnical = (json: string | null): SegmentTechnical | null => {
  if (!json) return null;
  const parsed = SegmentTechnicalSchema.safeParse(JSON.parse(json));
  return parsed.success ? parsed.data : null;
};

export const parseLineGeometry = (json: string | null): LineGeometry | null => {
  if (!json) return null;
  const parsed = LineGeometrySchema.safeParse(JSON.parse(json));
  return parsed.success ? parsed.data : null;
};
