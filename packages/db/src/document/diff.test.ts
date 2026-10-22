import { describe, expect, it } from "vitest";
import type { Position } from "../shared";
import { diffDocuments } from "./diff";
import { crossroadDocument } from "./fixtures";
import { addObservationRow, setPosition } from "./shape";

describe("diffDocuments", () => {
  it("returns nothing for identical documents", () => {
    const doc = crossroadDocument();
    expect(diffDocuments(doc, structuredClone(doc))).toEqual([]);
  });

  it("describes a header change with before and after", () => {
    const before = crossroadDocument();
    const after = { ...before, header: { ...before.header, isProjected: true, date: "2026-03-26" } };
    expect(diffDocuments(before, after)).toEqual(
      expect.arrayContaining([
        { section: "header", label: "Data", before: "2026-03-25", after: "2026-03-26" },
        { section: "header", label: "Estimada", before: "não", after: "sim" },
      ]),
    );
  });

  it("names the movement and the hour of a changed cell", () => {
    const before = crossroadDocument();
    const after = structuredClone(before);
    after.movements[0].cells[1] = 7;
    const changes = diffDocuments(before, after);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ section: "movements", before: "1", after: "7" });
    expect(changes[0].label).toContain("Norte → Leste");
    expect(changes[0].label).toContain("7h");
  });

  it("records a renamed approach", () => {
    const before = crossroadDocument();
    const after = { ...before, approaches: ["Norte", "Leste", "Sul", "Praça"] };
    expect(diffDocuments(before, after)).toEqual([
      { section: "approaches", label: "Aproximação 4", before: "Oeste", after: "Praça" },
    ]);
  });

  it("records the two approaches that traded positions", () => {
    const before = { ...crossroadDocument(), positions: ["N", "E", "S", "W"] satisfies Position[] };
    const after = setPosition(before, 0, "S");
    expect(diffDocuments(before, after).map((c) => c.label)).toEqual([
      "Posição da aproximação 1",
      "Posição da aproximação 3",
    ]);
  });

  it("reports an added observation row", () => {
    const before = crossroadDocument();
    const after = addObservationRow(before, "women", "Mulheres");
    expect(diffDocuments(before, after)).toEqual([
      { section: "observations", label: "Mulheres", before: null, after: "0" },
    ]);
  });
});
