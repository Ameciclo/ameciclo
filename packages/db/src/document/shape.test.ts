import { describe, expect, it } from "vitest";
import { crossroadDocument } from "./fixtures";
import { buildNewDocument, effectivePositions, reshapeTopology, setPosition } from "./shape";
import { validateDocument } from "./validate";

describe("buildNewDocument", () => {
  it("creates a draft with every movement at zero", () => {
    const doc = buildNewDocument({
      localId: 1,
      date: "2026-03-25",
      variant: null,
      startHour: 6,
      endHour: 20,
      bucketMinutes: 60,
      topology: "t_junction",
      approaches: ["A", "B", "C"],
      reportUrl: null,
    });
    expect(doc.header.status).toBe("draft");
    expect(doc.movements).toHaveLength(6);
    expect(doc.movements.every((m) => m.cells.length === 14 && m.cells.every((v) => v === 0))).toBe(true);
    expect(validateDocument(doc)).toEqual([]);
  });
});

describe("reshapeTopology", () => {
  it("keeps stored positions only when the number of approaches is unchanged", () => {
    const doc = { ...crossroadDocument(), positions: ["N", "E", "S", "W"] satisfies ("N" | "E" | "S" | "W")[] };
    expect(reshapeTopology(doc, "crossroad").positions).toEqual(["N", "E", "S", "W"]);
    expect(reshapeTopology(doc, "t_junction").positions).toBeNull();
  });

  it("adds the movements a bigger intersection needs", () => {
    const tjunction = reshapeTopology(crossroadDocument(), "t_junction");
    expect(tjunction.approaches).toHaveLength(3);
    expect(tjunction.movements).toHaveLength(6);
  });
});

describe("positions", () => {
  it("falls back to the default order of the topology", () => {
    expect(effectivePositions(crossroadDocument())).toEqual(["N", "E", "S", "W"]);
  });

  it("swaps with the approach that already held the position", () => {
    const doc = setPosition(crossroadDocument(), 0, "E");
    expect(doc.positions).toEqual(["E", "N", "S", "W"]);
  });
});
