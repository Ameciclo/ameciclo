import { getInitialRatingModes } from "./assessment";
import type { IdecicloFormData } from "./form-types";
import { PartialFormDataSchema } from "./form-types";
import { parseSegmentTechnical, type SegmentContext, type SegmentTechnical, type SegmentType } from "./segment-technical";
import { z } from "zod";

// Turning a segment and its OpenStreetMap prefill into form answers, and a
// stored form back into a complete set of answers.

/** What the form needs to know about the segment it evaluates. */
export type SegmentFormContext = {
  id: string;
  cityId: string;
  name: string;
  type: SegmentType;
  length: number;
  classification: string | null;
  technical: SegmentTechnical | null;
};

export const clampMinimumOne = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(1, Math.round(numeric));
};

export const clampNonNegative = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
};


export const mapDirectionPrefillToInfraFlow = (
  direction?: string
): "unidirectional" | "bidirectional" | undefined => {
  if (!direction) return undefined;
  const normalized = direction.toLowerCase();
  if (normalized.includes("bi")) return "bidirectional";
  if (normalized.includes("uni") || normalized.includes("contra")) return "unidirectional";
  return undefined;
};

export const mapPositionPrefillToForm = (position?: string): string | undefined => {
  if (!position) return undefined;
  const normalized = position.toLowerCase();
  if (normalized === "canteiro") return "canteiro";
  if (normalized === "pista_canteiro") return "pista_canteiro";
  if (normalized === "pista_calcada") return "pista_calcada";
  if (normalized === "calcada") return "calcada";
  if (normalized === "centro_pista") return "centro_pista";
  if (normalized === "isolada") return "isolada";
  if (normalized.includes("esquerdo") || normalized.includes("direito")) return "pista_calcada";
  if (normalized.includes("ambos")) return "pista_calcada";
  if (normalized.includes("calçada") || normalized.includes("calcada")) return "calcada";
  if (normalized.includes("canteiro")) return "canteiro";
  if (normalized.includes("dedicada") || normalized.includes("segregada")) return "isolada";
  return undefined;
};

export const mapFormTypologyToSegmentType = (
  value?: string
): SegmentType | undefined => {
  const normalized = (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("ciclovia")) return "Ciclovia";
  if (normalized.includes("ciclofaixa")) return "Ciclofaixa";
  if (normalized.includes("ciclorrota")) return "Ciclorrota";
  if (normalized.includes("partilhada") || normalized.includes("compartilhada")) {
    return "Compartilhada";
  }

  return undefined;
};

const OSM_SURFACE_TO_PAVEMENT_TYPE: Record<string, "A" | "B" | "C" | "D"> = {
  paved: "A",
  asphalt: "A",
  chipseal: "A",
  concrete: "A",
  "concrete:lanes": "A",
  "concrete:plates": "A",
  paving_stones: "B",
  "paving_stones:lanes": "B",
  bricks: "B",
  brick: "B",
  tiles: "B",
  sett: "C",
  unhewn_cobblestone: "C",
  cobblestone: "C",
  stepping_stones: "C",
  grass_paver: "C",
  stone: "C",
  unpaved: "D",
  compacted: "D",
  fine_gravel: "D",
  gravel: "D",
  pebblestone: "D",
  rock: "D",
  ground: "D",
  dirt: "D",
  earth: "D",
  grass: "D",
  mud: "D",
  sand: "D",
  woodchips: "D",
  metal: "D",
  metal_grid: "D",
  wood: "D",
  snow: "D",
  ice: "D",
  salt: "D",
};

const PREFILL_PAVEMENT_TO_TYPE: Record<string, "A" | "B" | "C" | "D"> = {
  "asfalto/concreto (melhor)": "A",
  "blocos (razoável)": "B",
  "paralelepípedo/pedra (regular)": "C",
  "inadequado/revisar": "D",
};

export const mapOsmSurfaceToPavementType = (
  surface?: string,
  prefillPavement?: string
): "A" | "B" | "C" | "D" | undefined => {
  const normalizedSurface = surface?.trim().toLowerCase();
  if (normalizedSurface && normalizedSurface in OSM_SURFACE_TO_PAVEMENT_TYPE) {
    return OSM_SURFACE_TO_PAVEMENT_TYPE[normalizedSurface];
  }

  const normalizedPrefill = prefillPavement?.trim().toLowerCase();
  if (normalizedPrefill && normalizedPrefill in PREFILL_PAVEMENT_TO_TYPE) {
    return PREFILL_PAVEMENT_TO_TYPE[normalizedPrefill];
  }

  return undefined;
};

export const mapIdecicloHierarchyToIntersectionRoadType = (
  hierarchy?: string
): "local" | "coletora" | "arterial" | "" => {
  const normalized = (hierarchy || "").toLowerCase();
  if (normalized === "estrutural") return "arterial";
  if (normalized === "alimentadora") return "coletora";
  if (normalized === "local") return "local";
  return "";
};

const CTB_SPEED_BY_HIERARCHY: Record<string, number> = {
  estrutural: 60,
  alimentadora: 40,
  local: 30,
};

export const getCtbSpeedForHierarchy = (hierarchy?: string | null) => {
  const normalized = (hierarchy || "").trim().toLowerCase();
  return CTB_SPEED_BY_HIERARCHY[normalized] ?? null;
};
export const applyOsmPrefillToFormData = (
  data: IdecicloFormData,
  segmentData: SegmentFormContext | null | undefined
): IdecicloFormData => {
  const technical = segmentData?.technical;
  const prefill = technical?.ideciclo_prefill;
  if (!segmentData || !technical || !prefill) return data;
  const inferredFlow = mapDirectionPrefillToInfraFlow(prefill.sentido);
  const inferredPosition = mapPositionPrefillToForm(prefill.posicaoNaVia);
  const inferredSpeed = prefill.velocidade ? Number(prefill.velocidade) : undefined;
  const inferredPavementType = mapOsmSurfaceToPavementType(
    technical.osm_tags?.surface,
    prefill.pavimento
  );
  const ctbSuggestedSpeed = getCtbSpeedForHierarchy(
    segmentData.classification || prefill.hierarquia || data.road_hierarchy
  );
  const selectedIntersections = (technical.selected_intersections ?? []).filter((item) => item.selected !== false);
  const inferredIntersectionCount = selectedIntersections.length;
  const inferredRoadTypesByIntersection = selectedIntersections.map((item) =>
    mapIdecicloHierarchyToIntersectionRoadType(item.hierarchyIdeciclo)
  );
  const inferredConnectionByIntersection = selectedIntersections.map(() => null);
  const inferredIntersectionNames = selectedIntersections.map(
    (item) => item.roadName || `Via ${item.roadId}`
  );
  const inferredIntersectionHighways = selectedIntersections.map(
    (item) => item.highway || ""
  );
  const inferredIntersectionOsmHierarchy = selectedIntersections.map(
    (item) => item.hierarchyOsm || ""
  );
  const inferredIntersectionIdecicloHierarchy = selectedIntersections.map(
    (item) => item.hierarchyIdeciclo || ""
  );

  return {
    ...data,
    start_point: data.start_point || prefill.trechoInicio || data.start_point,
    end_point: data.end_point || prefill.trechoFim || data.end_point,
    infra_typology: data.infra_typology || prefill.tipologia || data.infra_typology,
    road_hierarchy: data.road_hierarchy || prefill.hierarquia || data.road_hierarchy,
    classification: data.classification || prefill.hierarquia || data.classification,
    infra_flow: data.infra_flow !== "unidirectional" ? data.infra_flow : inferredFlow || data.infra_flow,
    position_on_road: data.position_on_road !== "pista_calcada"
      ? data.position_on_road
      : inferredPosition || data.position_on_road,
    velocity_kmh:
      data.velocity_kmh > 0
        ? data.velocity_kmh
        : Number.isFinite(inferredSpeed)
          ? Number(inferredSpeed)
          : ctbSuggestedSpeed ?? data.velocity_kmh,
    regulated_speed_choices:
      Array.isArray(data.regulated_speed_choices) && data.regulated_speed_choices.length > 0
        ? data.regulated_speed_choices
        : data.velocity_kmh > 0
          ? [data.velocity_kmh]
          : Number.isFinite(inferredSpeed)
            ? [Number(inferredSpeed)]
            : ctbSuggestedSpeed !== null
              ? [ctbSuggestedSpeed]
              : data.regulated_speed_choices,
    pavement_type: data.pavement_type || inferredPavementType || data.pavement_type,
    traffic_lanes_count:
      data.traffic_lanes_count !== 2
        ? data.traffic_lanes_count
        : prefill.numeroFaixas ?? data.traffic_lanes_count,
    width_meters:
      data.width_meters > 0 ? data.width_meters : prefill.largura ?? data.width_meters,
    blocks_count:
      data.blocks_count !== 1
        ? data.blocks_count
        : clampMinimumOne(
            technical.blocks_count ??
              technical.estimated_blocks_count ??
              data.blocks_count
          ),
    intersections_count:
      data.intersections_count !== 0
        ? data.intersections_count
        : inferredIntersectionCount > 0
          ? inferredIntersectionCount
          : clampNonNegative(
              technical.intersections_count ??
                technical.estimated_intersections_count ??
                data.intersections_count
            ),
    relevant_intersections_count:
      data.relevant_intersections_count !== 0
        ? data.relevant_intersections_count
        : inferredRoadTypesByIntersection.length > 0
          ? inferredRoadTypesByIntersection.filter(
              (value) => value === "coletora" || value === "arterial"
            ).length
          : clampNonNegative(
              technical.relevant_intersections_count ?? data.relevant_intersections_count
            ),
    connected_intersections_count:
      data.connected_intersections_count !== 0
        ? data.connected_intersections_count
        : clampNonNegative(
            technical.connected_intersections_count ?? data.connected_intersections_count
          ),
    intersection_road_type_by_intersection:
      Array.isArray(data.intersection_road_type_by_intersection) &&
      data.intersection_road_type_by_intersection.length > 0
        ? data.intersection_road_type_by_intersection
        : inferredRoadTypesByIntersection,
    intersection_has_cycling_connection_by_intersection:
      Array.isArray(data.intersection_has_cycling_connection_by_intersection) &&
      data.intersection_has_cycling_connection_by_intersection.length > 0
        ? data.intersection_has_cycling_connection_by_intersection
        : inferredConnectionByIntersection,
    intersection_name_by_intersection:
      Array.isArray(data.intersection_name_by_intersection) &&
      data.intersection_name_by_intersection.length > 0
        ? data.intersection_name_by_intersection
        : inferredIntersectionNames,
    intersection_highway_by_intersection:
      Array.isArray(data.intersection_highway_by_intersection) &&
      data.intersection_highway_by_intersection.length > 0
        ? data.intersection_highway_by_intersection
        : inferredIntersectionHighways,
    intersection_hierarchy_osm_by_intersection:
      Array.isArray(data.intersection_hierarchy_osm_by_intersection) &&
      data.intersection_hierarchy_osm_by_intersection.length > 0
        ? data.intersection_hierarchy_osm_by_intersection
        : inferredIntersectionOsmHierarchy,
    intersection_hierarchy_ideciclo_by_intersection:
      Array.isArray(data.intersection_hierarchy_ideciclo_by_intersection) &&
      data.intersection_hierarchy_ideciclo_by_intersection.length > 0
        ? data.intersection_hierarchy_ideciclo_by_intersection
        : inferredIntersectionIdecicloHierarchy,
  };
};

export const syncSegmentA1ToFormData = (
  data: IdecicloFormData,
  segmentData: SegmentFormContext | null | undefined
): IdecicloFormData => {
  if (!segmentData) return data;

  const prefill = segmentData.technical?.ideciclo_prefill;
  const inferredFlow = mapDirectionPrefillToInfraFlow(prefill?.sentido);
  const inferredPosition = mapPositionPrefillToForm(prefill?.posicaoNaVia);
  const inferredSpeed = prefill?.velocidade ? Number(prefill.velocidade) : 0;
  const ctbSuggestedSpeed = getCtbSpeedForHierarchy(
    segmentData.classification || prefill?.hierarquia || data.road_hierarchy
  );

  return {
    ...data,
    infra_typology: segmentData.type || prefill?.tipologia || data.infra_typology,
    road_hierarchy:
      segmentData.classification || prefill?.hierarquia || data.road_hierarchy,
    classification:
      segmentData.classification || prefill?.hierarquia || data.classification,
    infra_flow: inferredFlow || data.infra_flow,
    position_on_road: inferredPosition || data.position_on_road,
    velocity_kmh: inferredSpeed > 0 ? inferredSpeed : ctbSuggestedSpeed ?? data.velocity_kmh,
    regulated_speed_choices:
      inferredSpeed > 0
        ? [inferredSpeed]
        : ctbSuggestedSpeed !== null
          ? [ctbSuggestedSpeed]
          : data.regulated_speed_choices,
  };
};

export const buildOsmFieldDifferences = (
  data: IdecicloFormData,
  segmentData: SegmentFormContext | null
) => {
  const prefill = segmentData?.technical?.ideciclo_prefill;
  if (!prefill) return [];

  const differences: Array<{
    field: string;
    osmValue: string | number;
    observedValue: string | number;
  }> = [];

  const compare = (field: string, osmValue: string | number | undefined, observedValue: string | number) => {
    if (osmValue === undefined || osmValue === null || osmValue === "") return;
    if (String(osmValue).trim() === String(observedValue).trim()) return;
    differences.push({ field, osmValue, observedValue });
  };

  compare("tipologia", prefill.tipologia, data.infra_typology);
  compare("hierarquia", prefill.hierarquia, data.road_hierarchy);
  compare("velocidade", prefill.velocidade, data.velocity_kmh);
  compare("numeroFaixas", prefill.numeroFaixas, data.traffic_lanes_count);
  compare("largura", prefill.largura, data.width_meters);
  compare("trechoInicio", prefill.trechoInicio, data.start_point);
  compare("trechoFim", prefill.trechoFim, data.end_point);
  compare("sentido", mapDirectionPrefillToInfraFlow(prefill.sentido), data.infra_flow);
  compare("posicaoNaVia", mapPositionPrefillToForm(prefill.posicaoNaVia), data.position_on_road);

  return differences;
};
export const createEmptyFormData = (segmentId?: string | null): IdecicloFormData => ({
  researcher: "",
  date: new Date().toISOString().split("T")[0],
  city: "",
  city_id: "",
  id: segmentId || "",
  segment_id: segmentId || "",
  segment_name: "",
  extension_m: 0,
  velocity_kmh: 0,
  regulated_speed_choices: [],
  start_point: "",
  end_point: "",
  road_hierarchy: "",
  blocks_count: 1,
  intersections_count: 0,
  relevant_intersections_count: 0,
  connected_intersections_count: 0,
  intersection_road_type_by_intersection: [],
  intersection_has_cycling_connection_by_intersection: [],
  intersection_name_by_intersection: [],
  intersection_highway_by_intersection: [],
  intersection_hierarchy_osm_by_intersection: [],
  intersection_hierarchy_ideciclo_by_intersection: [],
  pedestrian_flow_per_hour_per_meter: 0,
  infra_typology: "",
  infra_flow: "unidirectional",
  position_on_road: "pista_calcada",
  width_meters: 0,
  width_measurements_m: [],
  includes_gutter: false,
  buffer_width_m: 0,
  buffer_measurements_m: [],
  speed_measures: [],
  traffic_calming_counts: {},
  avg_distance_measures_m: 0,
  no_traffic_calming_measures: false,
  pavement_type: "",
  conservation_state: "",
  separation_devices_ciclofaixa: "",
  separation_devices_ciclovia: "",
  separation_devices_calcada: "",
  devices_conservation: "",
  lateral_spacing_type: "",
  has_double_lateral_line: false,
  lateral_spacing_width_m: 0,
  spacing_conservation: "",
  space_identification: "",
  identification_conservation: "",
  pictograms_per_block: 0,
  pictograms_cover_all_blocks: false,
  pictograms_conservation: "",
  regulation_signs_per_block: 0,
  regulation_signs_per_block_by_block: [],
  signs_both_directions: null,
  signs_both_directions_by_block: [],
  vertical_signs_conservation: "",
  vertical_signs_conservation_by_block: [],
  traffic_lanes_count: 2,
  signalized_crossings_count: 0,
  traffic_lanes_count_by_block: [],
  signalized_crossings_count_by_block: [],
  no_risk_situations: false,
  risk_occurrence_counts: {},
  bus_stop_conflict: false,
  school_conflict: false,
  horizontal_obstacles: false,
  vertical_obstacles: false,
  side_change_mid_block: false,
  opposite_flow_direction: false,
  intersection_signaling: "",
  intersection_signaling_by_intersection: [],
  intersection_conservation: "",
  intersection_conservation_by_intersection: [],
  connection_accessibility: "",
  connection_accessibility_by_intersection: [],
  traffic_lanes_per_direction: 1,
  traffic_lanes_per_direction_by_intersection: [],
  mixed_lane_width_m: 2.7,
  mixed_lane_width_m_by_intersection: [],
  has_intersection_traffic_calming: false,
  has_intersection_traffic_calming_by_intersection: [],
  motorized_conflicts: [],
  motorized_conflicts_by_intersection: [],
  has_lighting_posts: null,
  lighting_rating: "",
  lighting_post_type: "",
  lighting_distance_m: 0,
  lighting_directed: null,
  lighting_barriers: null,
  lighting_distance_to_infra: "",
  shading_coverage: "",
  vegetation_size: "",
  blocks_with_cycling_furniture: 0,
  cycling_furniture: [],
  cycling_furniture_by_block: [],
  cycling_furniture_counts_by_block: [],
  no_cycling_furniture_by_block: [],
  observations: "",
  rating_modes: getInitialRatingModes(),
  manual_ratings: {},
  touched_fields: {},
  criterion_workflow_state: {},
});


// Fields older versions of the form wrote; read once, then dropped.
const LegacyFieldsSchema = z.object({
  signalized_crossings_per_block: z.number().optional(),
  bus_school_conflict: z.boolean().optional(),
});

/** A saved form's answers, including the legacy fields. */
export const StoredFormSchema = PartialFormDataSchema.extend(LegacyFieldsSchema.shape);
export type StoredForm = z.infer<typeof StoredFormSchema>;

const nonEmpty = <T>(values: T[] | undefined, fallback: T[]): T[] =>
  values !== undefined && values.length > 0 ? values : fallback;

/**
 * A complete set of answers from whatever was stored: missing fields take the
 * defaults, and the per-block / per-intersection lists older forms kept as a
 * single value are lifted into lists of one.
 */
export const mergeWithDefaults = (segmentId: string | null | undefined, incoming: StoredForm | null | undefined): IdecicloFormData => {
  const defaults = createEmptyFormData(segmentId);
  const { signalized_crossings_per_block, bus_school_conflict, ...data } = incoming ?? {};

  const intersectionsCount = Math.max(0, Number(data.intersections_count || 0));
  const relevantCount = Number(data.relevant_intersections_count || 0);
  const connectedCount = Number(data.connected_intersections_count || 0);

  const furnitureByBlock = nonEmpty(data.cycling_furniture_by_block, data.cycling_furniture && data.cycling_furniture.length > 0 ? [data.cycling_furniture] : []);

  return {
    ...defaults,
    ...data,
    buffer_width_m: data.buffer_width_m ?? defaults.buffer_width_m,
    buffer_measurements_m: data.buffer_measurements_m ?? defaults.buffer_measurements_m,
    traffic_calming_counts:
      data.traffic_calming_counts && Object.keys(data.traffic_calming_counts).length > 0
        ? data.traffic_calming_counts
        : Object.fromEntries((data.speed_measures ?? []).map((measure) => [measure, 1])),
    risk_occurrence_counts:
      data.risk_occurrence_counts && Object.keys(data.risk_occurrence_counts).length > 0
        ? data.risk_occurrence_counts
        : {
            ...(data.bus_stop_conflict || bus_school_conflict ? { bus_stop_conflict: 1 } : {}),
            ...(data.school_conflict ? { school_conflict: 1 } : {}),
            ...(data.horizontal_obstacles ? { horizontal_obstacles: 1 } : {}),
            ...(data.vertical_obstacles ? { vertical_obstacles: 1 } : {}),
            ...(data.side_change_mid_block ? { side_change_mid_block: 1 } : {}),
            ...(data.opposite_flow_direction ? { opposite_flow_direction: 1 } : {}),
          },
    intersection_signaling_by_intersection: nonEmpty(
      data.intersection_signaling_by_intersection,
      data.intersection_signaling ? [data.intersection_signaling] : [],
    ),
    intersection_road_type_by_intersection: nonEmpty(
      data.intersection_road_type_by_intersection,
      Array.from({ length: intersectionsCount }, (_, index) => (index < relevantCount ? "coletora" : "")),
    ),
    intersection_has_cycling_connection_by_intersection: nonEmpty(
      data.intersection_has_cycling_connection_by_intersection,
      Array.from({ length: intersectionsCount }, (_, index) => (index >= relevantCount ? null : index < connectedCount)),
    ),
    intersection_name_by_intersection: data.intersection_name_by_intersection ?? [],
    intersection_highway_by_intersection: data.intersection_highway_by_intersection ?? [],
    intersection_hierarchy_osm_by_intersection: data.intersection_hierarchy_osm_by_intersection ?? [],
    intersection_hierarchy_ideciclo_by_intersection: data.intersection_hierarchy_ideciclo_by_intersection ?? [],
    intersection_conservation_by_intersection: data.intersection_conservation_by_intersection ?? [],
    connection_accessibility_by_intersection: nonEmpty(
      data.connection_accessibility_by_intersection,
      data.connection_accessibility ? [data.connection_accessibility] : [],
    ),
    traffic_lanes_per_direction_by_intersection: nonEmpty(
      data.traffic_lanes_per_direction_by_intersection,
      typeof data.traffic_lanes_per_direction === "number" ? [data.traffic_lanes_per_direction] : [],
    ),
    mixed_lane_width_m_by_intersection: nonEmpty(
      data.mixed_lane_width_m_by_intersection,
      typeof data.mixed_lane_width_m === "number" ? [data.mixed_lane_width_m] : [],
    ),
    has_intersection_traffic_calming_by_intersection: nonEmpty(
      data.has_intersection_traffic_calming_by_intersection,
      typeof data.has_intersection_traffic_calming === "boolean" ? [data.has_intersection_traffic_calming] : [],
    ),
    motorized_conflicts_by_intersection: nonEmpty(
      data.motorized_conflicts_by_intersection,
      data.motorized_conflicts && data.motorized_conflicts.length > 0 ? [data.motorized_conflicts] : [],
    ),
    cycling_furniture_by_block: furnitureByBlock,
    cycling_furniture_counts_by_block: nonEmpty(
      data.cycling_furniture_counts_by_block,
      furnitureByBlock.map((items) => Object.fromEntries(items.map((item) => [item, 1]))),
    ),
    no_cycling_furniture_by_block: data.no_cycling_furniture_by_block ?? [],
    traffic_lanes_count_by_block: nonEmpty(
      data.traffic_lanes_count_by_block,
      typeof data.traffic_lanes_count === "number" ? [data.traffic_lanes_count] : [],
    ),
    signalized_crossings_count_by_block: nonEmpty(
      data.signalized_crossings_count_by_block,
      typeof data.signalized_crossings_count === "number" ? [data.signalized_crossings_count] : [],
    ),
    vertical_signs_conservation_by_block: data.vertical_signs_conservation_by_block ?? [],
    regulation_signs_per_block_by_block: nonEmpty(
      data.regulation_signs_per_block_by_block,
      typeof data.regulation_signs_per_block === "number" ? [data.regulation_signs_per_block] : [],
    ),
    signs_both_directions_by_block: nonEmpty(
      data.signs_both_directions_by_block,
      data.signs_both_directions !== undefined ? [data.signs_both_directions] : [],
    ),
    signalized_crossings_count: data.signalized_crossings_count ?? signalized_crossings_per_block ?? 0,
    id: data.id || defaults.id,
    segment_id: data.segment_id || defaults.segment_id,
    city_id: data.city_id || defaults.city_id,
    rating_modes: { ...defaults.rating_modes, ...data.rating_modes },
    manual_ratings: { ...data.manual_ratings },
  };
};

const longest = (...lists: (readonly unknown[] | undefined)[]) => Math.max(0, ...lists.map((list) => list?.length ?? 0));

/**
 * Keeps the counts the rest of the form reads (blocks, intersections, relevant
 * and connected intersections) in line with the per-block and per-intersection
 * lists the answers are kept in.
 */
export const normalizeEvaluationCounts = (data: IdecicloFormData): IdecicloFormData => {
  const blockListsLength = longest(
    data.regulation_signs_per_block_by_block,
    data.signs_both_directions_by_block,
    data.vertical_signs_conservation_by_block,
    data.traffic_lanes_count_by_block,
    data.signalized_crossings_count_by_block,
    data.cycling_furniture_by_block,
    data.cycling_furniture_counts_by_block,
    data.no_cycling_furniture_by_block,
  );
  const intersectionListsLength = longest(
    data.intersection_road_type_by_intersection,
    data.intersection_has_cycling_connection_by_intersection,
    data.intersection_name_by_intersection,
    data.intersection_hierarchy_osm_by_intersection,
    data.intersection_hierarchy_ideciclo_by_intersection,
    data.intersection_signaling_by_intersection,
    data.intersection_conservation_by_intersection,
    data.connection_accessibility_by_intersection,
    data.traffic_lanes_per_direction_by_intersection,
    data.mixed_lane_width_m_by_intersection,
    data.has_intersection_traffic_calming_by_intersection,
    data.motorized_conflicts_by_intersection,
  );
  const isRelevantRoad = (roadType: string) => roadType === "coletora" || roadType === "arterial";

  const blocksCount = Math.max(clampMinimumOne(data.blocks_count), blockListsLength || 1);
  const intersectionsCount = Math.max(clampNonNegative(data.intersections_count), intersectionListsLength);
  const roadTypes = data.intersection_road_type_by_intersection;
  const connections = data.intersection_has_cycling_connection_by_intersection;

  const relevantIntersectionsCount = Math.min(
    roadTypes.length > 0 ? roadTypes.filter(isRelevantRoad).length : clampNonNegative(data.relevant_intersections_count),
    intersectionsCount,
  );
  const connectedIntersectionsCount = Math.min(
    roadTypes.length > 0 || connections.length > 0
      ? roadTypes.reduce((sum, roadType, index) => (isRelevantRoad(roadType) && connections[index] === true ? sum + 1 : sum), 0)
      : clampNonNegative(data.connected_intersections_count),
    relevantIntersectionsCount,
  );

  return {
    ...data,
    blocks_count: blocksCount,
    intersections_count: intersectionsCount,
    relevant_intersections_count: relevantIntersectionsCount,
    connected_intersections_count: connectedIntersectionsCount,
  };
};

export const toSegmentFormContext = (segment: SegmentContext): SegmentFormContext => ({
  id: segment.id,
  cityId: segment.cityId,
  name: segment.name,
  type: segment.type,
  length: segment.length,
  classification: segment.classification,
  technical: parseSegmentTechnical(segment.technical),
});

/** The empty counts a header takes from the segment, when the form has none of its own. */
const segmentCounts = (technical: SegmentTechnical | null) => ({
  blocks_count: typeof technical?.blocks_count === "number" ? technical.blocks_count : 1,
  intersections_count: typeof technical?.intersections_count === "number" ? technical.intersections_count : 0,
  relevant_intersections_count: typeof technical?.relevant_intersections_count === "number" ? technical.relevant_intersections_count : 0,
  connected_intersections_count: typeof technical?.connected_intersections_count === "number" ? technical.connected_intersections_count : 0,
});

/** What the header of a form saved earlier lacks, taken from the segment and the city. */
const hydrateHeaderFields = (data: IdecicloFormData, segment: SegmentFormContext, cityName: string): IdecicloFormData => ({
  ...data,
  id: data.id || segment.id,
  segment_id: data.segment_id || segment.id,
  city: data.city || cityName,
  city_id: data.city_id || segment.cityId,
  segment_name: data.segment_name || segment.name,
  infra_typology: data.infra_typology || segment.type,
  extension_m: data.extension_m || segment.length,
  road_hierarchy: data.road_hierarchy || segment.classification || "",
  classification: data.classification || segment.classification || undefined,
  blocks_count:
    data.touched_fields?.blocks_count || data.blocks_count !== 1 ? data.blocks_count : clampMinimumOne(segment.technical?.blocks_count),
  intersections_count:
    data.touched_fields?.intersections_count || data.intersections_count !== 0
      ? data.intersections_count
      : clampNonNegative(segment.technical?.intersections_count),
});

/**
 * The answers the form opens with. A form saved earlier is merged with
 * defaults; a new one starts from the segment. A local draft, newer than
 * either, replaces them. The segment's OpenStreetMap prefill then fills what is
 * still empty, and the segment's typology, hierarchy, speed, direction and
 * position are re-applied.
 */
export const buildInitialFormData = (input: {
  segment: SegmentFormContext;
  cityName: string;
  stored: StoredForm | null;
  draft: StoredForm | null;
}): IdecicloFormData => {
  const { segment, cityName, stored, draft } = input;

  let data: IdecicloFormData;
  if (stored) {
    const merged = mergeWithDefaults(segment.id, { ...stored, id: segment.id, segment_id: segment.id, city_id: stored.city_id || segment.cityId });
    data = applyOsmPrefillToFormData(hydrateHeaderFields(merged, segment, cityName), segment);
  } else {
    const fresh = mergeWithDefaults(segment.id, {
      id: segment.id,
      segment_id: segment.id,
      segment_name: segment.name,
      infra_typology: segment.type,
      city: cityName,
      city_id: segment.cityId,
      extension_m: segment.length,
      road_hierarchy: segment.classification || "",
      classification: segment.classification || undefined,
      ...segmentCounts(segment.technical),
    });
    data = applyOsmPrefillToFormData(fresh, segment);
  }

  if (draft) data = mergeWithDefaults(segment.id, draft);

  return normalizeEvaluationCounts(syncSegmentA1ToFormData(applyOsmPrefillToFormData(data, segment), segment));
};

const resized = <T>(values: readonly T[] | undefined, length: number, fallback: T): T[] =>
  Array.from({ length }, (_, index) => (values && index < values.length ? (values[index] ?? fallback) : fallback));

const BLOCK_TOUCH_KEYS = ["block_b41_signs", "block_b41_directions", "block_e41", "block_b5_crossings", "block_b5_lanes", "block_d3"];

/** The answers that change when the form gets more or fewer blocks (quadras): their lists, and which were touched. */
export const resizeBlocks = (data: IdecicloFormData, nextCount: number): Partial<IdecicloFormData> => {
  const touched = data.touched_fields ?? {};
  const span = Math.max(data.blocks_count, nextCount);

  return {
    blocks_count: nextCount,
    regulation_signs_per_block_by_block: resized(data.regulation_signs_per_block_by_block, nextCount, 0),
    signs_both_directions_by_block: resized(data.signs_both_directions_by_block, nextCount, null),
    vertical_signs_conservation_by_block: resized(data.vertical_signs_conservation_by_block, nextCount, ""),
    traffic_lanes_count_by_block: resized(data.traffic_lanes_count_by_block, nextCount, 0),
    signalized_crossings_count_by_block: resized(data.signalized_crossings_count_by_block, nextCount, 0),
    cycling_furniture_by_block: resized(data.cycling_furniture_by_block, nextCount, []),
    cycling_furniture_counts_by_block: resized(data.cycling_furniture_counts_by_block, nextCount, {}),
    no_cycling_furniture_by_block: resized(data.no_cycling_furniture_by_block, nextCount, false),
    touched_fields: Object.fromEntries(
      BLOCK_TOUCH_KEYS.flatMap((key) =>
        Array.from({ length: span }, (_, index) => [`${key}_${index}`, index < nextCount ? (touched[`${key}_${index}`] ?? false) : false]),
      ),
    ),
  };
};

const INTERSECTION_TOUCH_KEYS = [
  "intersection_a2_type",
  "intersection_a2_connection",
  "intersection_c1",
  "intersection_c2",
  "intersection_c3",
  "intersection_c3_lanes",
  "intersection_c3_width",
  "intersection_c3_calming",
];

/** The same for intersections. */
export const resizeIntersections = (data: IdecicloFormData, nextCount: number): Partial<IdecicloFormData> => {
  const touched = data.touched_fields ?? {};
  const span = Math.max(data.intersections_count, nextCount);

  return {
    intersections_count: nextCount,
    intersection_road_type_by_intersection: resized(data.intersection_road_type_by_intersection, nextCount, ""),
    intersection_has_cycling_connection_by_intersection: resized(data.intersection_has_cycling_connection_by_intersection, nextCount, null),
    intersection_name_by_intersection: resized(data.intersection_name_by_intersection, nextCount, ""),
    intersection_highway_by_intersection: resized(data.intersection_highway_by_intersection, nextCount, ""),
    intersection_hierarchy_osm_by_intersection: resized(data.intersection_hierarchy_osm_by_intersection, nextCount, ""),
    intersection_hierarchy_ideciclo_by_intersection: resized(data.intersection_hierarchy_ideciclo_by_intersection, nextCount, ""),
    intersection_signaling_by_intersection: resized(data.intersection_signaling_by_intersection, nextCount, ""),
    intersection_conservation_by_intersection: resized(data.intersection_conservation_by_intersection, nextCount, ""),
    connection_accessibility_by_intersection: resized(data.connection_accessibility_by_intersection, nextCount, ""),
    traffic_lanes_per_direction_by_intersection: resized(data.traffic_lanes_per_direction_by_intersection, nextCount, 1),
    mixed_lane_width_m_by_intersection: resized(data.mixed_lane_width_m_by_intersection, nextCount, 2.7),
    has_intersection_traffic_calming_by_intersection: resized(data.has_intersection_traffic_calming_by_intersection, nextCount, false),
    motorized_conflicts_by_intersection: resized(data.motorized_conflicts_by_intersection, nextCount, []),
    touched_fields: Object.fromEntries(
      INTERSECTION_TOUCH_KEYS.flatMap((key) =>
        Array.from({ length: span }, (_, index) => [`${key}_${index}`, index < nextCount ? (touched[`${key}_${index}`] ?? false) : false]),
      ),
    ),
  };
};
