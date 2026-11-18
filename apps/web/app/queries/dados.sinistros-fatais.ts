import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DeathOverview, DeathStats } from "@ameciclo/db/deaths-read";

// Mortes no trânsito (SIM/DATASUS), do banco. Tudo são contagens: nenhum óbito individual sai do servidor.

export const DEFAULT_YEARS_SHOWN = 10;

// Onde a pessoa morreu, em grupos que se explicam sozinhos.
export const PLACES = {
  via: { label: "Na via pública", codes: ["4"] },
  hospital: { label: "No hospital ou outro estabelecimento de saúde", codes: ["1", "2"] },
  outros: { label: "Em casa ou em outro lugar", codes: ["3", "5", "9"] },
} as const;
export type PlaceKey = keyof typeof PLACES;

// A página não tem entrada no Strapi: título e capa são fixos, e não há arquivos de apoio.
const PAGE_DATA = {
  title: "Observatório de Sinistros Fatais",
  coverImage: "/pages_covers/sinistros-fatais.png",
  supportFiles: [],
};

const fetchOverview = createServerFn({ method: "GET" }).handler(async () => {
  let overview: DeathOverview | null = null;
  try {
    const { withDb } = await import("~/lib/db.server");
    const { getDeathOverview } = await import("@ameciclo/db/deaths-read");
    overview = await withDb((db) => getDeathOverview(db));
  } catch (error) {
    console.error("Error loading the traffic deaths overview from the database:", error);
  }

  return {
    pageData: PAGE_DATA,
    overview: overview && overview.years.length > 0 ? overview : null,
  };
});

const StatsInput = z.object({
  basis: z.enum(["ocorrencia", "residencia"]),
  city: z.number().int().optional(),
  from: z.number().int(),
  to: z.number().int(),
  place: z.enum(["via", "hospital", "outros"]).optional(),
});
export type StatsInput = z.infer<typeof StatsInput>;

const fetchStats = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => StatsInput.parse(input))
  .handler(async ({ data }): Promise<DeathStats | null> => {
    try {
      const { withDb } = await import("~/lib/db.server");
      const { getDeathStats } = await import("@ameciclo/db/deaths-read");
      return await withDb((db) =>
        getDeathStats(db, {
          basis: data.basis,
          city: data.city,
          yearFrom: data.from,
          yearTo: data.to,
          places: data.place ? [...PLACES[data.place].codes] : undefined,
        }),
      );
    } catch (error) {
      console.error("Error loading the traffic deaths statistics from the database:", error);
      return null;
    }
  });

export const sinistrosOverviewQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "sinistros-fatais"],
    queryFn: () => fetchOverview(),
    staleTime: 10 * 60 * 1000,
  });

export const sinistrosStatsQueryOptions = (input: StatsInput) =>
  queryOptions({
    queryKey: ["dados", "sinistros-fatais", "stats", input],
    queryFn: () => fetchStats({ data: input }),
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

export type Selection = {
  basis: "ocorrencia" | "residencia";
  /** Município (código do SIM); sem ele, a RMR inteira. */
  city: number | undefined;
  from: number;
  to: number;
  place: PlaceKey | undefined;
};

type SearchInput = { olhar?: "ocorrencia" | "residencia"; cidade?: number; de?: number; ate?: number; local?: PlaceKey };

// Tudo o que faltar ou não existir volta ao padrão: RMR inteira, por ocorrência, os últimos 10 anos.
export function resolveSelection(overview: DeathOverview, search: SearchInput): Selection {
  const first = overview.years[0];
  const last = overview.years[overview.years.length - 1];
  const inRange = (y: number | undefined) => (y !== undefined && y >= first && y <= last ? y : undefined);
  const basis = search.olhar ?? "ocorrencia";
  const known = overview.byBasis[basis].byCity.some((c) => c.city === search.cidade);
  const to = inRange(search.ate) ?? last;
  const from = Math.min(inRange(search.de) ?? Math.max(first, last - DEFAULT_YEARS_SHOWN + 1), to);
  return { basis, city: known ? search.cidade : undefined, from, to, place: search.local };
}
