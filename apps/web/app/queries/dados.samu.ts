import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SamuEvolutionRow, SamuProfile, SamuSummary } from "@ameciclo/db";

// SAMU calls about traffic crashes, from the database. Everything is a count:
// no individual call leaves the server.

const OverviewInput = z.object({ onlyComplete: z.boolean() });

type Loaded = { summary: SamuSummary; state: SamuProfile };

async function load(onlyComplete: boolean): Promise<Loaded | null> {
  try {
    const { withDb } = await import("~/lib/db.server");
    const { getSamuProfile, getSamuSummary } = await import("@ameciclo/db");
    return await withDb(async (db) => {
      const summary = await getSamuSummary(db, { rmrOnly: true, onlyCompleteYears: onlyComplete });
      const state = await getSamuProfile(db, { rmrOnly: true, years: summary.years.map((y) => y.year) });
      return { summary, state };
    });
  } catch (error) {
    console.error("Error loading the SAMU summary from the database:", error);
    return null;
  }
}

const fetchSamu = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => OverviewInput.parse(input))
  .handler(async ({ data }) => {
  const loaded = await load(data.onlyComplete);
  return {
    until: loaded?.summary.until ?? null,
    years: loaded?.summary.years ?? [],
    partialYears: loaded?.summary.partialYears ?? [],
    cities: loaded?.summary.cities ?? [],
    // The whole Região Metropolitana do Recife, for the headline numbers.
    state: loaded?.state ?? null,
    dataUnavailable: !loaded || loaded.summary.cities.length === 0,
  };
});

export type SamuOverview = Awaited<ReturnType<typeof fetchSamu>>;

const CityInput = z.object({
  cityIbge: z.number().int(),
  fromYear: z.number().int(),
  toYear: z.number().int(),
  // The years the page is showing (complete ones only, or all).
  years: z.array(z.number().int()),
});

export type SamuCityView = { profile: SamuProfile | null; evolution: SamuEvolutionRow[] };

// The profile of one city in a range of years, and its yearly evolution.
const fetchSamuCity = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => CityInput.parse(input))
  .handler(async ({ data }): Promise<SamuCityView> => {
    try {
      const { withDb } = await import("~/lib/db.server");
      const { getSamuEvolution, getSamuProfile } = await import("@ameciclo/db");
      return await withDb(async (db) => ({
        profile: await getSamuProfile(db, data),
        evolution: await getSamuEvolution(db, data.cityIbge, data.years),
      }));
    } catch (error) {
      console.error("Error loading the SAMU city view from the database:", error);
      return { profile: null, evolution: [] };
    }
  });

export const samuQueryOptions = (input: z.infer<typeof OverviewInput>) =>
  queryOptions({
    queryKey: ["dados", "samu", input],
    queryFn: () => fetchSamu({ data: input }),
    staleTime: 10 * 60 * 1000,
  });

export const samuCityQueryOptions = (input: z.infer<typeof CityInput>) =>
  queryOptions({
    queryKey: ["dados", "samu", "city", input],
    queryFn: () => fetchSamuCity({ data: input }),
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

const RECIFE = 2611606;

// ?cidade=2611606&de=2024&ate=2025. Anything missing or unknown falls back to
// Recife, over every year.
export function resolveSamuSelection(
  overview: Pick<SamuOverview, "years" | "cities">,
  search: { cidade?: number; de?: number; ate?: number },
) {
  const years = overview.years.map((y) => y.year);
  const first = years[0] ?? 0;
  const last = years[years.length - 1] ?? 0;
  const city =
    overview.cities.find((c) => c.ibge === search.cidade) ??
    overview.cities.find((c) => c.ibge === RECIFE) ??
    overview.cities[0];
  const from = search.de && years.includes(search.de) ? search.de : first;
  const to = search.ate && years.includes(search.ate) ? Math.max(search.ate, from) : last;
  return { city, from, to };
}
