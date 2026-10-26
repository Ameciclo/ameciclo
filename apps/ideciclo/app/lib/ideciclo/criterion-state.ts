import type { A1DecisionStatus } from "./assessment";
import type { CriterionCode, IdecicloFormData, IdecicloRating } from "./form-types";

// Which criteria the evaluator has answered or pinned for review, and how far
// each block and intersection has come. Drives the navigation and the filters.

const isCiclorrota = (data: IdecicloFormData) => String(data.infra_typology || "").toLowerCase().includes("ciclorrota");

const hasTouched = (data: IdecicloFormData, fields: string[]) => fields.some((field) => Boolean(data.touched_fields?.[field]));

/** The key a criterion has in `criterion_workflow_state` (the form's own numbering, e.g. B.1 is "b11"). */
export const workflowKeyOf = (code: CriterionCode, data: IdecicloFormData): string => {
  const ciclorrota = isCiclorrota(data);
  switch (code) {
    case "A1": return "a1";
    case "A2": return "a2";
    case "B1": return "b11";
    case "B6": return "b12";
    case "B2": return "b2";
    case "E2": return "e2";
    case "B3": return "b31";
    case "E3": return "e31";
    case "B4": return ciclorrota ? "b43" : "b41";
    case "E4": return ciclorrota ? "e43" : "e42";
    case "B5": return "b5";
    case "B7": return "b7";
    case "C1": return "c1";
    case "E1": return "e1";
    case "C2": return "c2";
    case "C3": return "c3";
    case "D1": return "d1";
    case "D2": return "d2";
    case "D3": return "d3";
  }
};

/** The element id of a criterion's accordion, for the navigation to scroll to. */
export const criterionAnchor = (code: CriterionCode, data: IdecicloFormData): string => `criterion-${workflowKeyOf(code, data)}`;

export const isCriterionAnswered = (
  data: IdecicloFormData,
  code: CriterionCode,
  state: { a1Status: A1DecisionStatus; resolvedRating: IdecicloRating | null | undefined },
): boolean => {
  if (data.manual_ratings[code]) return true;
  if (code === "A1") return state.a1Status !== "pending";

  const touched = (fields: string[]) => hasTouched(data, fields);
  const ciclorrota = isCiclorrota(data);

  switch (code) {
    case "A2":
      return (
        data.intersection_road_type_by_intersection.some((value) => Boolean(value)) ||
        data.intersection_has_cycling_connection_by_intersection.some((value) => value !== null)
      );
    case "B5":
      return touched(["signalized_crossings_count", "signalized_crossings_count_by_block", "traffic_lanes_count", "traffic_lanes_count_by_block"]);
    case "B6": {
      const total = Object.values(data.traffic_calming_counts).reduce((sum, value) => sum + Number(value || 0), 0);
      return total > 0 || data.no_traffic_calming_measures;
    }
    case "B7":
      return (
        data.no_risk_situations ||
        data.bus_stop_conflict ||
        data.school_conflict ||
        data.horizontal_obstacles ||
        data.vertical_obstacles ||
        data.side_change_mid_block ||
        data.opposite_flow_direction
      );
    case "B4":
      return ciclorrota
        ? touched(["pictograms_per_block", "pictograms_cover_all_blocks"])
        : touched(["regulation_signs_per_block", "regulation_signs_per_block_by_block", "signs_both_directions", "signs_both_directions_by_block", "space_identification"]);
    case "C1":
      return touched(["intersection_signaling_by_intersection", "intersection_signaling"]);
    case "C2":
      return touched(["connection_accessibility_by_intersection", "connection_accessibility"]);
    case "E1":
      return touched(["intersection_conservation_by_intersection", "intersection_conservation"]);
    case "C3":
      return ciclorrota
        ? touched([
            "traffic_lanes_per_direction_by_intersection",
            "mixed_lane_width_m_by_intersection",
            "has_intersection_traffic_calming_by_intersection",
            "traffic_lanes_per_direction",
            "mixed_lane_width_m",
            "has_intersection_traffic_calming",
          ])
        : touched(["motorized_conflicts_by_intersection", "motorized_conflicts"]);
    case "D1":
      return touched(["lighting_rating"]);
    case "D3":
      return touched(["blocks_with_cycling_furniture", "cycling_furniture", "cycling_furniture_by_block", "cycling_furniture_counts_by_block", "no_cycling_furniture_by_block"]);
    default:
      return Boolean(state.resolvedRating);
  }
};

/** A pinned criterion is one the evaluator marked "analysis": to come back to. */
export const isCriterionPinned = (data: IdecicloFormData, code: CriterionCode): boolean => {
  const workflow = data.criterion_workflow_state ?? {};
  const ciclorrota = isCiclorrota(data);

  switch (code) {
    case "B4":
      return ciclorrota ? workflow.b43 === "analysis" : workflow.b41 === "analysis" || workflow.b42 === "analysis";
    case "E3":
      return workflow.e31 === "analysis" || workflow.e32 === "analysis";
    case "E4":
      return ciclorrota ? workflow.e43 === "analysis" : workflow.e41 === "analysis" || workflow.e42 === "analysis";
    case "C1":
      return workflow.c1 === "analysis" || workflow.c1e1 === "analysis";
    case "E1":
      return workflow.e1 === "analysis" || workflow.c1e1 === "analysis";
    default:
      return workflow[workflowKeyOf(code, data)] === "analysis";
  }
};

/** Per block: every question a block has been asked is answered (the ciclorrota skips B.4.1 and E.4.1). */
export const blockCompletionStates = (data: IdecicloFormData): boolean[] => {
  const ciclorrota = isCiclorrota(data);
  const touched = (key: string, index: number) => Boolean(data.touched_fields?.[`${key}_${index}`]);

  return Array.from({ length: data.blocks_count }, (_, index) => {
    const b41 = ciclorrota || (touched("block_b41_signs", index) && touched("block_b41_directions", index));
    const e41 = ciclorrota || touched("block_e41", index);
    const b5 = touched("block_b5_crossings", index) && touched("block_b5_lanes", index);
    const d3 = touched("block_d3", index);
    return b41 && e41 && b5 && d3;
  });
};

/** Per intersection: A.2, C.1, E.1, C.2 and C.3 answered (the ciclorrota skips C.1 and E.1). */
export const intersectionCompletionStates = (data: IdecicloFormData): boolean[] => {
  const ciclorrota = isCiclorrota(data);
  const touched = (key: string, index: number) => Boolean(data.touched_fields?.[`${key}_${index}`]);

  return Array.from({ length: data.intersections_count }, (_, index) => {
    const connection = data.intersection_has_cycling_connection_by_intersection[index];
    const a2 = Boolean(data.intersection_road_type_by_intersection[index]) && connection !== null && connection !== undefined;
    const c1 = ciclorrota || touched("intersection_c1", index);
    const e1 = ciclorrota || Boolean(data.intersection_conservation_by_intersection[index]);
    const c2 = touched("intersection_c2", index);
    const c3 = ciclorrota
      ? touched("intersection_c3_lanes", index) && touched("intersection_c3_width", index) && touched("intersection_c3_calming", index)
      : touched("intersection_c3", index);
    return a2 && c1 && e1 && c2 && c3;
  });
};
