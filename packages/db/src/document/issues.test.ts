import { describe, expect, it } from "vitest";
import { crossroadDocument } from "./fixtures";
import { type DictionaryEntry, detectIssues } from "./issues";

const dictionary: DictionaryEntry[] = [
  { key: "caronas", parentKey: null, isRollup: true },
  { key: "carona_homem", parentKey: "caronas", isRollup: false },
  { key: "carona_mulher", parentKey: "caronas", isRollup: false },
];

const codes = (doc: Parameters<typeof detectIssues>[0]) => detectIssues(doc, dictionary).map((i) => i.code);

describe("detectIssues", () => {
  it("finds nothing wrong in a complete count", () => {
    expect(codes(crossroadDocument())).toEqual([]);
  });

  it("flags a day where only some hours were counted", () => {
    const doc = crossroadDocument();
    for (const m of doc.movements) m.cells = [4, 0, 0];
    expect(codes(doc)).toContain("partial_day");
  });

  it("flags a count with no cyclists at all", () => {
    const doc = crossroadDocument();
    for (const m of doc.movements) m.cells = [0, 0, 0];
    expect(codes(doc)).toContain("no_data");
  });

  it("flags a characteristic label with no mapping", () => {
    const doc = crossroadDocument();
    doc.observations.push({
      basis: "observed",
      block: "observacoes",
      position: 0,
      rawLabel: "Patinete",
      characteristicKey: null,
      cells: [1, 1, 1],
      total: null,
    });
    expect(detectIssues(doc, dictionary)).toContainEqual(
      expect.objectContaining({ code: "unmapped_label", ref: "Patinete" }),
    );
  });

  it("flags a rollup that does not match its parts", () => {
    const doc = crossroadDocument();
    const row = (key: string, total: number) => ({
      basis: "observed" as const,
      block: "observacoes" as const,
      position: doc.observations.length,
      rawLabel: key,
      characteristicKey: key,
      cells: [],
      total,
    });
    doc.observations.push(row("caronas", 100), row("carona_homem", 30), row("carona_mulher", 20));
    expect(detectIssues(doc, dictionary)).toContainEqual(
      expect.objectContaining({ code: "rollup_mismatch", severity: "warning" }),
    );
  });

  it("flags movements that do not cover every pair of approaches", () => {
    const doc = crossroadDocument();
    doc.movements.pop();
    expect(codes(doc)).toContain("movements_incomplete");
  });
});
