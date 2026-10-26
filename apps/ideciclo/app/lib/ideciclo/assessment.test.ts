import { describe, expect, it } from "vitest";
import { getA1Decision, getMedianRating, getScoreBreakdown, isCriterionApplicable } from "./assessment";
import type { PartialFormData } from "./form-types";

// A ciclovia on a structural road, 60 km/h, with the best answer to every criterion:
// A 10 + B 35 + C 21 + D 9 + E 25 = 100, the maximum for a ciclovia.
const perfectCiclovia: PartialFormData = {
  infra_typology: "Ciclovia",
  road_hierarchy: "estrutural",
  velocity_kmh: 60,
  infra_flow: "bidirectional",
  relevant_intersections_count: 4,
  connected_intersections_count: 4,
  intersections_count: 2,
  blocks_count: 2,
  width_meters: 3,
  pavement_type: "A",
  separation_devices_ciclovia: "A",
  lateral_spacing_width_m: 1.2,
  regulation_signs_per_block_by_block: [2, 2],
  signs_both_directions_by_block: [true, true],
  space_identification: "A",
  signalized_crossings_count_by_block: [2, 2],
  intersection_signaling: "A",
  connection_accessibility: "A",
  motorized_conflicts: ["no_conversion"],
  lighting_rating: "A",
  shading_coverage: "A",
  blocks_with_cycling_furniture: 1,
  intersection_conservation_by_intersection: ["good", "good"],
  conservation_state: "A",
  devices_conservation: "A",
  spacing_conservation: "A",
  identification_conservation: "A",
  regulation_signs_per_block: 2,
  vertical_signs_conservation_by_block: ["good", "good"],
  touched_fields: { motorized_conflicts: true, blocks_with_cycling_furniture: true },
};

describe("getScoreBreakdown", () => {
  it("gives a ciclovia with every best answer the maximum of 100", () => {
    const breakdown = getScoreBreakdown(perfectCiclovia);

    expect(breakdown.eliminated).toBe(false);
    expect(breakdown.total).toBe(100);
    expect(breakdown.sections.A?.score).toBe(10);
    expect(breakdown.sections.B?.score).toBe(35);
    expect(breakdown.sections.C?.score).toBe(21);
    expect(breakdown.sections.D?.score).toBe(9);
    expect(breakdown.sections.E?.score).toBe(25);
  });

  it("zeroes the whole score when A.1 is D (ciclorrota on a structural road)", () => {
    const breakdown = getScoreBreakdown({ ...perfectCiclovia, infra_typology: "Ciclorrota" });

    expect(breakdown.resolvedRatings.A1).toBe("D");
    expect(breakdown.eliminated).toBe(true);
    expect(breakdown.total).toBe(0);
  });

  it("never lets section B go below zero, however bad the risk situations", () => {
    // B.7 on a ciclofaixa: three risk occurrences is D, worth -33 points.
    const breakdown = getScoreBreakdown({
      infra_typology: "Ciclofaixa",
      road_hierarchy: "local",
      bus_stop_conflict: true,
      school_conflict: true,
      horizontal_obstacles: true,
    });

    expect(breakdown.resolvedRatings.B7).toBe("D");
    expect(breakdown.sections.B?.items.B7?.points).toBe(-33);
    expect(breakdown.sections.B?.score).toBe(0);
    expect(breakdown.total).toBe(0);
  });

  it("uses the manual rating only when the criterion is in manual mode", () => {
    const auto = getScoreBreakdown({ ...perfectCiclovia, manual_ratings: { E2: "D" } });
    const manual = getScoreBreakdown({ ...perfectCiclovia, manual_ratings: { E2: "D" }, rating_modes: { E2: "manual" } });

    expect(auto.resolvedRatings.E2).toBe("A");
    expect(manual.resolvedRatings.E2).toBe("D");
    // E.2 is worth 7 points on an A and 0 on a D for a ciclovia.
    expect(manual.total).toBe(93);
  });
});

describe("getA1Decision", () => {
  it("is pending until typology and hierarchy are known", () => {
    expect(getA1Decision({}).status).toBe("pending");
  });

  it("rejects a ciclofaixa on a feeder road at 50 km/h or more, accepts it below", () => {
    const base: PartialFormData = { infra_typology: "Ciclofaixa", road_hierarchy: "alimentadora" };

    expect(getA1Decision({ ...base, velocity_kmh: 50 }).rating).toBe("D");
    expect(getA1Decision({ ...base, velocity_kmh: 40 }).rating).toBe("A");
  });

  it("rejects a shared sidewalk above 200 pedestrians per hour per metre", () => {
    const decision = getA1Decision({
      infra_typology: "Compartilhada",
      road_hierarchy: "alimentadora",
      pedestrian_flow_per_hour_per_meter: 201,
    });

    expect(decision.status).toBe("incompatible");
  });
});

describe("getMedianRating", () => {
  it("takes the lower median and ignores empty answers", () => {
    expect(getMedianRating(["A", "B", "C", "D"])).toBe("B");
    expect(getMedianRating(["A", null, "C", "D"])).toBe("C");
    expect(getMedianRating([null, undefined])).toBeNull();
  });
});

describe("isCriterionApplicable", () => {
  it("drops criteria the typology does not have", () => {
    expect(isCriterionApplicable({ infra_typology: "Ciclorrota" }, "B1")).toBe(false);
    expect(isCriterionApplicable({ infra_typology: "Ciclorrota" }, "B6")).toBe(true);
    expect(isCriterionApplicable({ infra_typology: "Ciclovia" }, "B1")).toBe(true);
  });
});
