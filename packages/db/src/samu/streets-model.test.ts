import { describe, expect, it } from "vitest";

import { atKm, atVias, concentrationByKm, concentrationByVia } from "./streets-model";

const streets = [
  { calls: 50, lengthKm: 10 },
  { calls: 30, lengthKm: null },
  { calls: 20, lengthKm: 5 },
];

describe("concentração", () => {
  it("por via: soma os chamados e os km conhecidos, sobre os chamados identificados", () => {
    const pts = concentrationByVia(streets, 200);
    expect(pts.map((p) => p.share)).toEqual([25, 40, 50]);
    expect(pts.map((p) => p.km)).toEqual([10, 10, 15]);
    expect(pts.map((p) => p.vias)).toEqual([1, 2, 3]);
  });

  it("por km: pula as vias sem extensão, que não têm lugar no eixo", () => {
    const pts = concentrationByKm(streets, 200);
    expect(pts).toEqual([
      { vias: 1, km: 10, share: 25 },
      { vias: 2, km: 15, share: 35 },
    ]);
  });

  it("sem chamados identificados, a parcela é 0 (nada de divisão por zero)", () => {
    expect(concentrationByVia(streets, 0).every((p) => p.share === 0)).toBe(true);
    expect(concentrationByKm(streets, 0).every((p) => p.share === 0)).toBe(true);
  });

  it("atVias: null quando o ranking tem menos vias", () => {
    const pts = concentrationByVia(streets, 200);
    expect(atVias(pts, 2)?.share).toBe(40);
    expect(atVias(pts, 10)).toBeNull();
  });

  it("atKm: o último ponto que cabe; null se o ranking não chega a tantos km", () => {
    const pts = concentrationByKm(streets, 200);
    expect(atKm(pts, 12)).toEqual({ vias: 1, km: 10, share: 25 });
    expect(atKm(pts, 15)?.vias).toBe(2);
    expect(atKm(pts, 100)).toBeNull();
    expect(atKm(pts, 5)).toBeNull();
  });
});
