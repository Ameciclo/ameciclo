import { z } from "zod";
import { IdecicloPrefillSchema } from "./segment-technical";

// The evaluation form's answers. Stored as-is in ideciclo_form.responses, so
// the schema is also what a saved form is validated against when it is loaded.

export const CRITERION_CODES = [
  "A1", "A2",
  "B1", "B2", "B3", "B4", "B5", "B6", "B7",
  "C1", "C2", "C3",
  "D1", "D2", "D3",
  "E1", "E2", "E3", "E4",
] as const;

const CriterionCodeSchema = z.enum(CRITERION_CODES);
export type CriterionCode = z.infer<typeof CriterionCodeSchema>;

const RatingSchema = z.enum(["A", "B", "C", "D"]);
export type IdecicloRating = z.infer<typeof RatingSchema>;
export type RatingMode = "auto" | "manual";
export type CriterionWorkflowState = "default" | "analysis";

const ratingOrEmpty = z.union([RatingSchema, z.literal("")]);
const TRAFFIC_CALMING_MEASURES = ["lombada", "valas", "faixa_elevada", "elevacao_intersecao", "reducao_largura"] as const;
const RISK_OCCURRENCES = [
  "bus_stop_conflict",
  "school_conflict",
  "horizontal_obstacles",
  "vertical_obstacles",
  "side_change_mid_block",
  "opposite_flow_direction",
] as const;
const CYCLING_FURNITURE = ["bicicletarios", "paraciclos", "compartilhadas", "estacoes", "bebedouros"] as const;

export type IntersectionRoadType = IdecicloFormData["intersection_road_type_by_intersection"][number];
export type IntersectionHorizontalSignsCondition = IdecicloFormData["intersection_conservation_by_intersection"][number];
export type VerticalSignsConditionByBlock = IdecicloFormData["vertical_signs_conservation_by_block"][number];
export type TrafficCalmingMeasure = (typeof TRAFFIC_CALMING_MEASURES)[number];
export type RiskOccurrenceKey = (typeof RISK_OCCURRENCES)[number];
export type CyclingFurnitureKey = (typeof CYCLING_FURNITURE)[number];

const IdecicloFormDataObject = z.object({
  researcher: z.string(),
  date: z.string(),
  city: z.string(),
  city_id: z.string(),
  id: z.string(),
  segment_id: z.string(),
  segment_name: z.string(),
  extension_m: z.number(),
  velocity_kmh: z.number(),
  regulated_speed_choices: z.array(z.number()),
  start_point: z.string(),
  end_point: z.string(),
  road_hierarchy: z.string(),
  classification: z.string().optional(),
  blocks_count: z.number(),
  intersections_count: z.number(),
  relevant_intersections_count: z.number(),
  connected_intersections_count: z.number(),
  intersection_road_type_by_intersection: z.array(z.enum(["local", "coletora", "arterial", ""])),
  intersection_has_cycling_connection_by_intersection: z.array(z.boolean().nullable()),
  intersection_name_by_intersection: z.array(z.string()),
  intersection_highway_by_intersection: z.array(z.string()),
  intersection_hierarchy_osm_by_intersection: z.array(z.string()),
  intersection_hierarchy_ideciclo_by_intersection: z.array(z.string()),
  pedestrian_flow_per_hour_per_meter: z.number(),
  infra_typology: z.string(),
  infra_flow: z.string(),
  position_on_road: z.string(),
  width_meters: z.number(),
  width_measurements_m: z.array(z.number()),
  includes_gutter: z.boolean(),
  buffer_width_m: z.number(),
  buffer_measurements_m: z.array(z.number()),
  speed_measures: z.array(z.string()),
  traffic_calming_counts: z.partialRecord(z.enum(TRAFFIC_CALMING_MEASURES), z.number()),
  avg_distance_measures_m: z.number(),
  no_traffic_calming_measures: z.boolean(),
  pavement_type: ratingOrEmpty,
  conservation_state: ratingOrEmpty,
  separation_devices_ciclofaixa: ratingOrEmpty,
  separation_devices_ciclovia: ratingOrEmpty,
  separation_devices_calcada: ratingOrEmpty,
  devices_conservation: ratingOrEmpty,
  lateral_spacing_type: z.string(),
  has_double_lateral_line: z.boolean(),
  lateral_spacing_width_m: z.number(),
  spacing_conservation: ratingOrEmpty,
  space_identification: ratingOrEmpty,
  identification_conservation: ratingOrEmpty,
  pictograms_per_block: z.number(),
  pictograms_cover_all_blocks: z.boolean(),
  pictograms_conservation: ratingOrEmpty,
  regulation_signs_per_block: z.number(),
  regulation_signs_per_block_by_block: z.array(z.number()),
  signs_both_directions: z.boolean().nullable(),
  signs_both_directions_by_block: z.array(z.boolean().nullable()),
  vertical_signs_conservation: ratingOrEmpty,
  vertical_signs_conservation_by_block: z.array(z.enum(["good", "damage", ""])),
  traffic_lanes_count: z.number(),
  signalized_crossings_count: z.number(),
  traffic_lanes_count_by_block: z.array(z.number()),
  signalized_crossings_count_by_block: z.array(z.number()),
  no_risk_situations: z.boolean(),
  risk_occurrence_counts: z.partialRecord(z.enum(RISK_OCCURRENCES), z.number()),
  bus_stop_conflict: z.boolean(),
  school_conflict: z.boolean(),
  horizontal_obstacles: z.boolean(),
  vertical_obstacles: z.boolean(),
  side_change_mid_block: z.boolean(),
  opposite_flow_direction: z.boolean(),
  intersection_signaling: ratingOrEmpty,
  intersection_signaling_by_intersection: z.array(ratingOrEmpty),
  intersection_conservation: ratingOrEmpty,
  intersection_conservation_by_intersection: z.array(z.enum(["good", "damage", "none", ""])),
  connection_accessibility: z.enum(["A", "D", "NA", ""]),
  connection_accessibility_by_intersection: z.array(z.enum(["A", "D", "NA", ""])),
  traffic_lanes_per_direction: z.number(),
  traffic_lanes_per_direction_by_intersection: z.array(z.number()),
  mixed_lane_width_m: z.number(),
  mixed_lane_width_m_by_intersection: z.array(z.number()),
  has_intersection_traffic_calming: z.boolean(),
  has_intersection_traffic_calming_by_intersection: z.array(z.boolean()),
  motorized_conflicts: z.array(z.string()),
  motorized_conflicts_by_intersection: z.array(z.array(z.string())),
  has_lighting_posts: z.boolean().nullable(),
  lighting_rating: ratingOrEmpty,
  lighting_post_type: z.enum(["A", "B", ""]),
  lighting_distance_m: z.number(),
  lighting_directed: z.boolean().nullable(),
  lighting_barriers: z.boolean().nullable(),
  lighting_distance_to_infra: z.enum(["A", "B", ""]),
  shading_coverage: ratingOrEmpty,
  vegetation_size: z.enum(["A", "B", "C", ""]),
  blocks_with_cycling_furniture: z.number(),
  cycling_furniture: z.array(z.string()),
  cycling_furniture_by_block: z.array(z.array(z.string())),
  cycling_furniture_counts_by_block: z.array(z.partialRecord(z.enum(CYCLING_FURNITURE), z.number())),
  no_cycling_furniture_by_block: z.array(z.boolean()),
  observations: z.string(),
  rating_modes: z.partialRecord(CriterionCodeSchema, z.enum(["auto", "manual"])),
  manual_ratings: z.partialRecord(CriterionCodeSchema, RatingSchema),
  touched_fields: z.record(z.string(), z.boolean()).optional(),
  criterion_workflow_state: z.record(z.string(), z.enum(["default", "analysis"])).optional(),
  score_breakdown: z.unknown().optional(),
  criterion_ratings: z.partialRecord(CriterionCodeSchema, RatingSchema.nullable()).optional(),
  auto_ratings: z.partialRecord(CriterionCodeSchema, RatingSchema.nullable()).optional(),
  total_score: z.number().optional(),
  saved_offline: z.boolean().optional(),
  last_local_save_at: z.string().nullable().optional(),
  osm_prefill_snapshot: IdecicloPrefillSchema.nullable().optional(),
  osm_field_differences: z
    .array(z.object({ field: z.string(), osmValue: z.union([z.string(), z.number()]), observedValue: z.union([z.string(), z.number()]) }))
    .optional(),
});

export type IdecicloFormData = z.infer<typeof IdecicloFormDataObject>;

// A saved form, or a draft: any subset of the answers.
export const PartialFormDataSchema = IdecicloFormDataObject.partial();
export type PartialFormData = z.infer<typeof PartialFormDataSchema>;

/** The complete answers: what a form holds when it is submitted. */
export const FormDataSchema = IdecicloFormDataObject;

export const isRating = (value: unknown): value is IdecicloRating => RatingSchema.safeParse(value).success;

// Typed "no answer yet" values for the per-block and per-intersection lists.
export const NO_ROAD_TYPE: IntersectionRoadType = "";
export const NO_CONDITION: IntersectionHorizontalSignsCondition = "";
export const NO_BLOCK_CONDITION: VerticalSignsConditionByBlock = "";
export const NO_ANSWER: boolean | null = null;
