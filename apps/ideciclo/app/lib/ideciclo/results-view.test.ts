import { describe, expect, it } from "vitest";
import type { SegmentResultEntry } from "./results";
import { DEFAULT_FILTERS, filterSegments, hasActiveFilters, segmentStatusLabel } from "./results-view";

const entry = (overrides: Partial<SegmentResultEntry>): SegmentResultEntry => ({
  id: "1",
  rawSegmentId: "c_1",
  displayName: "Avenida Boa Viagem",
  typeLabel: "Ciclovia",
  hierarchy: "estrutural",
  hierarchyLabel: "Estrutural",
  lengthKm: 1,
  evaluated: true,
  score: 80,
  scoreBand: "score-75-plus",
  a1Rating: "A",
  adequate: true,
  contributes: true,
  contribution: 0.8,
  geometry: null,
  ...overrides,
});

const segments = [
  entry({ id: "1", displayName: "Avenida Boa Viagem" }),
  entry({ id: "2", displayName: "Rua da Aurora", evaluated: false, score: null, scoreBand: "score-unavailable", contributes: false, contribution: 0, adequate: null }),
  entry({ id: "3", displayName: "Avenida Cais", adequate: false, contributes: false, contribution: 0, score: 0, scoreBand: "score-below-25", hierarchy: null, hierarchyLabel: "Sem hierarquia" }),
];

describe("filterSegments", () => {
  it("searches ignoring case and accents", () => {
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, search: "AVENIDA" }).map((s) => s.id)).toEqual(["1", "3"]);
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, search: "aurora" }).map((s) => s.id)).toEqual(["2"]);
  });

  it("filters by what enters the calculation", () => {
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, calculation: "validos" }).map((s) => s.id)).toEqual(["1"]);
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, calculation: "incompativeis" }).map((s) => s.id)).toEqual(["3"]);
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, calculation: "sem-hierarquia" }).map((s) => s.id)).toEqual(["3"]);
    expect(filterSegments(segments, { ...DEFAULT_FILTERS, calculation: "sem-nota" }).map((s) => s.id)).toEqual(["2"]);
  });

  it("sorts by score, descending, with unscored segments last", () => {
    const sorted = filterSegments(segments, { ...DEFAULT_FILTERS, sortField: "score", sortDirection: "desc" });

    expect(sorted.map((s) => s.id)).toEqual(["1", "3", "2"]);
  });
});

describe("hasActiveFilters", () => {
  it("ignores the sort order", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sortField: "score" })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: "  " })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, status: "avaliados" })).toBe(true);
  });
});

describe("segmentStatusLabel", () => {
  it("tells apart pending, incompatible, unclassified and counted", () => {
    expect(segmentStatusLabel(segments[1])).toBe("Pendente");
    expect(segmentStatusLabel(segments[2])).toBe("A1 = D");
    expect(segmentStatusLabel(entry({ hierarchy: null }))).toBe("Sem hierarquia");
    expect(segmentStatusLabel(entry({}))).toBe("Entra no cálculo");
  });
});
