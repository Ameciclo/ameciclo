import { describe, expect, it } from "vitest";
import { calculateFormRating, calculateIdeciclo, getIdecicloClassification } from "./calculator";

describe("calculateFormRating", () => {
  it("averages the A-D criteria that were answered (A = 1, B = 0.7, C = 0.4, D = 0)", () => {
    expect(calculateFormRating({ pavement_type: "A", conservation_state: "C" })).toBeCloseTo(0.7);
    expect(calculateFormRating({ pavement_type: "B", shading_coverage: "D", intersection_signaling: "A" })).toBeCloseTo(
      (0.7 + 0 + 1) / 3,
    );
  });

  it("ignores criteria without a valid rating and is 0 with none", () => {
    expect(calculateFormRating({ pavement_type: "", conservation_state: "X" })).toBe(0);
    expect(calculateFormRating(null)).toBe(0);
  });
});

describe("calculateIdeciclo", () => {
  const structural = { id: "s1", length: 2, classification: "estrutural" };
  const local = { id: "l1", length: 1, classification: "local" };

  it("weights each network's GAM: structural 0.59, feeder 0.262, local 0.148", () => {
    // Structural all A: GAM 1 -> 0.59. Local: A and C average 0.7 -> 0.7 x 0.148 = 0.1036.
    const forms = [
      { segmentId: "s1", responses: { pavement_type: "A", conservation_state: "A" } },
      { segmentId: "l1", responses: { pavement_type: "A", conservation_state: "C" } },
    ];

    expect(calculateIdeciclo([structural, local], forms)).toBeCloseTo(0.59 + 0.1036, 6);
  });

  it("averages by length inside a network", () => {
    // Two structural segments, 2 km rated 1.0 and 1 km rated 0.4: (2 + 0.4) / 3 = 0.8.
    const forms = [
      { segmentId: "s1", responses: { pavement_type: "A" } },
      { segmentId: "s2", responses: { pavement_type: "C" } },
    ];

    expect(calculateIdeciclo([structural, { id: "s2", length: 1, classification: "estrutural" }], forms)).toBeCloseTo(0.8 * 0.59);
  });

  it("counts a segment without classification as local and skips segments without a form", () => {
    const forms = [{ segmentId: "x", responses: { pavement_type: "A" } }];

    expect(calculateIdeciclo([{ id: "x", length: 1, classification: null }, structural], forms)).toBeCloseTo(0.148);
  });
});

describe("getIdecicloClassification", () => {
  it("cuts at 0.4, 0.7 and 1.0", () => {
    expect(getIdecicloClassification(0.39)).toBe("D");
    expect(getIdecicloClassification(0.4)).toBe("C");
    expect(getIdecicloClassification(0.7)).toBe("B");
    expect(getIdecicloClassification(1)).toBe("A");
  });
});
