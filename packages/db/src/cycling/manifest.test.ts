import { describe, expect, it } from "vitest";

import { type Manifest, manifestProblems } from "./manifest";

const now = Date.parse("2026-11-17T12:00:00Z");
const part = (key: string, ways: number, timestamp: string | null = "2026-11-17T10:00:00Z") => ({
  key,
  timestamp,
  endpoint: "https://overpass-api.de/api/interpreter",
  relations: 0,
  ways,
});

const good: Manifest = {
  version: 1,
  prefix: "staging/2026-11-17/x",
  collectedAt: "2026-11-17T11:00:00Z",
  pdcWayIds: 1000,
  relations: { ...part("rel", 0), relations: 236 },
  pdcWays: [part("a", 500), part("b", 480)],
  infrastructure: [part("t1", 100), part("t2", 0)],
};

describe("manifestProblems", () => {
  it("accepts a complete, recent snapshot", () => {
    expect(manifestProblems(good, now)).toEqual([]);
  });

  it("refuses when too few PDC ways arrived", () => {
    const problems = manifestProblems({ ...good, pdcWays: [part("a", 100)] }, now);
    expect(problems.join()).toContain("trechos do PDC");
  });

  it("refuses when there are no relations or no infrastructure", () => {
    expect(manifestProblems({ ...good, relations: part("rel", 0) }, now).join()).toContain("relação");
    expect(manifestProblems({ ...good, infrastructure: [part("t", 0)] }, now).join()).toContain("infraestrutura");
  });

  it("refuses pieces whose OSM data is months old", () => {
    const stale = { ...good, infrastructure: [part("t1", 100, "2026-07-28T02:16:18Z")] };
    expect(manifestProblems(stale, now).join()).toContain("velho demais");
  });
});
