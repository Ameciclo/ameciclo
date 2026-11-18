import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  getSamuProfile,
  getSamuSummary,
  listSamuStreets,
  type SamuFilter,
  type SamuProfile,
  type SamuStreetRow,
  type SamuSummary,
} from "@ameciclo/db";

// SAMU calls about traffic crashes. Only counts: no individual call is returned.

export type { SamuFilter, SamuProfile, SamuStreetRow, SamuSummary };

export const getSamuSummaryFn = createServerFn({ method: "GET" }).handler(async (): Promise<SamuSummary> => {
  const { withDb } = await import("~/lib/db.server");
  return withDb((db) => getSamuSummary(db));
});

export const getSamuProfileFn = createServerFn({ method: "GET" })
  .inputValidator((input: SamuFilter) => input)
  .handler(async ({ data }): Promise<SamuProfile> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb((db) => getSamuProfile(db, data));
  });

export const listSamuStreetsFn = createServerFn({ method: "GET" })
  .inputValidator((input: SamuFilter) => input)
  .handler(async ({ data }): Promise<SamuStreetRow[]> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb((db) => listSamuStreets(db, data, 100));
  });

export const samuSummaryQueryOptions = () =>
  queryOptions({ queryKey: ["samu", "summary"], queryFn: () => getSamuSummaryFn() });
export const samuProfileQueryOptions = (filter: SamuFilter) =>
  queryOptions({ queryKey: ["samu", "profile", filter], queryFn: () => getSamuProfileFn({ data: filter }) });
export const samuStreetsQueryOptions = (filter: SamuFilter) =>
  queryOptions({ queryKey: ["samu", "streets", filter], queryFn: () => listSamuStreetsFn({ data: filter }) });
