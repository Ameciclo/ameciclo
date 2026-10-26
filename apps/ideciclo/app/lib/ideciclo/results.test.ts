import { describe, expect, it } from "vitest";
import type { CityDto, FormDto, SegmentDto } from "./domain";
import { calculateCityResults } from "./results";

const city: CityDto = {
  id: "2611606",
  name: "Recife",
  state: "PE",
  evaluatedKm: 0,
  ideciclo: 0,
  structuralKm: 4,
  feederKm: 0,
  localKm: 0,
  showInRanking: false,
};

const segment = (id: string, length: number, classification: string | null): SegmentDto => ({
  id,
  cityId: city.id,
  name: `Trecho ${id}`,
  type: "Ciclovia",
  length,
  neighborhood: null,
  geometry: null,
  classification,
  parentSegmentId: null,
  evaluated: false,
  formId: null,
});

const form = (segmentId: string, responses: Record<string, unknown>): FormDto => ({
  id: `form-${segmentId}`,
  segmentId,
  cityId: city.id,
  researcher: null,
  streetName: null,
  hierarchy: null,
  responses: JSON.stringify(responses),
});

describe("calculateCityResults", () => {
  it("turns each segment's score into km-weighted contribution and the network GAM", () => {
    // 2 km at score 80 contributes 1.6; over the 4 km of structural roads the GAM is 0.4,
    // and 0.4 x 0.6 = 0.24 is the city's preview.
    const results = calculateCityResults(
      city,
      [segment(`${city.id}_1`, 2, "estrutural"), segment(`${city.id}_2`, 1, "estrutural")],
      [form(`${city.id}_1`, { total_score: 80, road_hierarchy: "estrutural" })],
    );

    expect(results.networks.estrutural.contributionSum).toBeCloseTo(1.6);
    expect(results.networks.estrutural.gam).toBeCloseTo(0.4);
    expect(results.summary.previewIdeciclo).toBeCloseTo(0.24);
    expect(results.summary).toMatchObject({ totalStructures: 2, evaluatedStructures: 1, pendingStructures: 1, officialReady: false });
  });

  it("keeps a segment whose A.1 is D out of the calculation", () => {
    const results = calculateCityResults(
      city,
      [segment(`${city.id}_1`, 2, "estrutural")],
      [form(`${city.id}_1`, { total_score: 0, criterion_ratings: { A1: "D" } })],
    );

    expect(results.segments[0]).toMatchObject({ evaluated: true, adequate: false, contributes: false, contribution: 0 });
    expect(results.summary.incompatibleStructures).toBe(1);
  });

  it("matches forms to segments whether or not the id carries the city prefix", () => {
    const results = calculateCityResults(city, [segment("7", 1, "local")], [form(`${city.id}_7`, { total_score: 50 })]);

    expect(results.segments[0]?.evaluated).toBe(true);
    expect(results.segments[0]?.scoreBand).toBe("score-50-plus");
  });

  it("is ready for the official ranking only when every segment is evaluated and classified", () => {
    const results = calculateCityResults(
      city,
      [segment(`${city.id}_1`, 1, "estrutural")],
      [form(`${city.id}_1`, { total_score: 90 })],
    );

    expect(results.summary.officialReady).toBe(true);
  });
});
