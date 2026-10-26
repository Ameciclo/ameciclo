import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { ideCity, ideForm, ideSegment } from "@ameciclo/db/schema";

import { getIdecicloClassification, stripCityPrefix, type Classification } from "~/lib/public/format";
import { parseGeometry } from "~/lib/public/geometry";
import {
  buildStructureDetails,
  calculateCityResults,
  displayedIndex,
  type CityResultsBreakdown,
  type PublicCity,
  type PublicForm,
  type PublicSegment,
  type PublicStructureDetail,
} from "~/lib/public/results";

// Read-only views for the public pages: ranking, city and structure details.

type CityRow = typeof ideCity.$inferSelect;
type SegmentRow = typeof ideSegment.$inferSelect;
type FormRow = typeof ideForm.$inferSelect;

const toCity = (row: CityRow): PublicCity => ({
  id: row.id,
  name: row.name,
  state: row.state,
  ideciclo: row.ideciclo,
  structuralKm: row.structuralKm,
  feederKm: row.feederKm,
  localKm: row.localKm,
});

// Segment ids are saved with the city code in front ("2611606_123"); the pages use the bare id.
const toSegment = (row: SegmentRow): PublicSegment => ({
  id: stripCityPrefix(row.id, row.cityId),
  name: row.name,
  type: row.type,
  length: row.length,
  neighborhood: row.neighborhood,
  classification: row.classification,
  parentSegmentId: row.parentSegmentId ? stripCityPrefix(row.parentSegmentId, row.cityId) : null,
  geometry: parseGeometry(row.geometry),
});

const toForm = (row: FormRow): PublicForm => ({
  id: row.id,
  segmentId: stripCityPrefix(row.segmentId, row.cityId),
  streetName: row.streetName,
  hierarchy: row.hierarchy,
  intersectionsCount: row.intersectionsCount,
  blocksCount: row.blocksCount,
  responses: row.responses,
});

type CityData = { city: PublicCity; segments: PublicSegment[]; forms: PublicForm[]; results: CityResultsBreakdown };

async function loadCities(db: import("@ameciclo/db").Db, cityIds: string[]): Promise<CityData[]> {
  if (cityIds.length === 0) return [];
  const cities = await db.select().from(ideCity).where(inArray(ideCity.id, cityIds));
  const segments = await db
    .select()
    .from(ideSegment)
    .where(and(inArray(ideSegment.cityId, cityIds), isNull(ideSegment.deletedAt)));
  const forms = await db.select().from(ideForm).where(inArray(ideForm.cityId, cityIds));

  return cities.map((row) => {
    const city = toCity(row);
    const citySegments = segments.filter((s) => s.cityId === row.id).map(toSegment);
    const cityForms = forms.filter((f) => f.cityId === row.id).map(toForm);
    return { city, segments: citySegments, forms: cityForms, results: calculateCityResults(city, citySegments, cityForms) };
  });
}

export type RankedCity = {
  city: PublicCity;
  ideciclo: number;
  classification: Classification;
  segmentsCount: number;
};

// A city is ranked when it was released and has at least one saved form.
async function loadRanking(db: import("@ameciclo/db").Db): Promise<RankedCity[]> {
  const released = await db.select({ id: ideCity.id }).from(ideCity).where(eq(ideCity.showInRanking, true));
  const withForms = await db.selectDistinct({ id: ideForm.cityId }).from(ideForm).where(inArray(ideForm.cityId, released.map((c) => c.id).concat("")));
  const data = await loadCities(
    db,
    withForms.map((c) => c.id),
  );

  return data
    .map(({ city, segments, results }) => {
      const ideciclo = displayedIndex(city, results);
      return { city, ideciclo, classification: getIdecicloClassification(ideciclo), segmentsCount: segments.length };
    })
    .sort((left, right) => right.ideciclo - left.ideciclo);
}

export const getRanking = createServerFn({ method: "GET" }).handler(async (): Promise<RankedCity[]> => {
  const { withDb } = await import("~/lib/db.server");
  return withDb(loadRanking);
});

export type CityDetail = {
  city: PublicCity;
  index: number;
  rankingPosition: number | null;
  rankedCount: number;
  results: CityResultsBreakdown;
  structures: PublicStructureDetail[];
};

export const getCityDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { cityId: string }) => input)
  .handler(async ({ data }): Promise<CityDetail | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [loaded] = await loadCities(db, [data.cityId]);
      if (!loaded) return null;
      const ranking = await loadRanking(db);
      const position = ranking.findIndex((ranked) => ranked.city.id === data.cityId) + 1;
      return {
        city: loaded.city,
        index: displayedIndex(loaded.city, loaded.results),
        rankingPosition: position > 0 ? position : null,
        rankedCount: ranking.length,
        results: loaded.results,
        structures: buildStructureDetails(loaded.segments, loaded.forms, loaded.results),
      };
    });
  });

export const rankingQueryOptions = () => queryOptions({ queryKey: ["public", "ranking"], queryFn: () => getRanking() });
export const cityDetailQueryOptions = (cityId: string) =>
  queryOptions({ queryKey: ["public", "city", cityId], queryFn: () => getCityDetail({ data: { cityId } }) });
