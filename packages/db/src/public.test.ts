import { describe, expect, it } from "vitest";
import { characteristicsOf } from "./public";

const sums = (entries: Record<string, number>) => new Map(Object.entries(entries));

describe("characteristicsOf", () => {
  it("prefers the spreadsheet's rollup total over its nested rows", () => {
    expect(characteristicsOf(sums({ caronas: 50, carona_crianca: 1, carona_mulher: 2, carona_homem: 3 })).ride).toBe(50);
  });

  it("falls back to the sum of the nested rows when there is no rollup", () => {
    expect(characteristicsOf(sums({ carona_crianca: 1, carona_mulher: 2, carona_homem: 3 })).ride).toBe(6);
  });

  it("keeps a rollup of zero instead of falling back to the parts", () => {
    expect(characteristicsOf(sums({ contramaos: 0, contramao: 4 })).wrong_way).toBe(0);
  });

  it("adds every motorized variant", () => {
    expect(characteristicsOf(sums({ motorizada: 2, ciclomotor: 3, motorizada_ou_eletrica: 4 })).motor).toBe(9);
  });

  it("maps the direct counts and zeroes what is missing", () => {
    const result = characteristicsOf(sums({ women: 10, bike_pe: 7 }));
    expect(result.women).toBe(10);
    expect(result.shared_bike).toBe(7);
    expect(result.helmet).toBe(0);
  });
});
