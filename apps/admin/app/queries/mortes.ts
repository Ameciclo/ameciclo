import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Basis, DeathFilters, DeathOverview, DeathStats } from "@ameciclo/db/deaths-read";

// Mortes no trânsito (SIM/DATASUS). Só agregados: nenhum óbito individual é devolvido.

export type { Basis, DeathOverview, DeathStats };
export type DeathsFilter = Pick<DeathFilters, "basis" | "city" | "yearFrom" | "yearTo">;

export const getDeathOverviewFn = createServerFn({ method: "GET" }).handler(async (): Promise<DeathOverview> => {
  const { withDb } = await import("~/lib/db.server");
  const { getDeathOverview } = await import("@ameciclo/db/deaths-read");
  return withDb((db) => getDeathOverview(db));
});

export const getDeathStatsFn = createServerFn({ method: "GET" })
  .inputValidator((input: DeathsFilter) => input)
  .handler(async ({ data }): Promise<DeathStats> => {
    const { withDb } = await import("~/lib/db.server");
    const { getDeathStats } = await import("@ameciclo/db/deaths-read");
    return withDb((db) => getDeathStats(db, data));
  });

export const deathOverviewQueryOptions = () =>
  queryOptions({ queryKey: ["mortes", "overview"], queryFn: () => getDeathOverviewFn() });
export const deathStatsQueryOptions = (filter: DeathsFilter) =>
  queryOptions({ queryKey: ["mortes", "stats", filter], queryFn: () => getDeathStatsFn({ data: filter }) });
