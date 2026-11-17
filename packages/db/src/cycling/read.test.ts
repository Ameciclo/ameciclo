import { describe, expect, it } from "vitest";

import { type CyclingSnapshotRow, cityStats, historySeries, totalStats } from "./read";

const km = { ibge: 2611606, name: "Recife", designatedKm: 30, undesignatedKm: 20, outsidePdcKm: 50, notExecutedKm: 150 };

describe("cityStats", () => {
  it("derives what the page shows from the four statuses", () => {
    const stats = cityStats(km);
    expect(stats.executedInPdcKm).toBe(50);
    expect(stats.plannedKm).toBe(200);
    expect(stats.existingKm).toBe(100);
    expect(stats.percent).toBe(25);
  });

  it("is 0% where nothing is planned, not NaN", () => {
    expect(cityStats({ ...km, designatedKm: 0, undesignatedKm: 0, notExecutedKm: 0 }).percent).toBe(0);
  });
});

describe("totalStats", () => {
  it("adds the municipalities and recomputes the percentage over the sums", () => {
    const small = cityStats({ ...km, ibge: 1, name: "A", designatedKm: 10, undesignatedKm: 0, outsidePdcKm: 0, notExecutedKm: 10 });
    const big = cityStats({ ...km, ibge: 2, name: "B", designatedKm: 0, undesignatedKm: 0, outsidePdcKm: 5, notExecutedKm: 80 });
    const all = totalStats([small, big]);
    expect(all.plannedKm).toBe(100);
    expect(all.executedInPdcKm).toBe(10);
    // 10%, not the 25% of averaging 50% and 0%.
    expect(all.percent).toBe(10);
    expect(all.outsidePdcKm).toBe(5);
  });
});

describe("historySeries", () => {
  const row = (runId: number, at: string, cityIbge: number, designatedKm: number, notExecutedKm: number): CyclingSnapshotRow => ({
    runId,
    at,
    cityIbge,
    designatedKm,
    undesignatedKm: 0,
    outsidePdcKm: 1,
    notExecutedKm,
  });

  it("groups by sync, oldest first, with the totals and each municipality", () => {
    const series = historySeries([
      row(7, "2026-11-24T07:00:00Z", 1, 12, 8),
      row(3, "2026-11-17T17:11:48Z", 1, 10, 10),
      row(3, "2026-11-17T17:11:48Z", 2, 0, 80),
    ]);
    expect(series.map((p) => p.runId)).toEqual([3, 7]);
    expect(series[0]?.all).toMatchObject({ executedInPdcKm: 10, plannedKm: 100, outsidePdcKm: 2, percent: 10 });
    expect(series[0]?.byCity[2]).toMatchObject({ executedInPdcKm: 0, plannedKm: 80 });
    expect(series[1]?.all.percent).toBe(60);
  });

  it("is empty before the first sync", () => {
    expect(historySeries([])).toEqual([]);
  });
});
