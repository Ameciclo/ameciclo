import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { COUNTINGS_PAGE_DATA } from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

const PageInput = z.object({
  id: z.number().int().positive(),
  contagem: z.number().int().positive().optional(),
});

// One place with all of its counts, plus the hourly detail of the selected count
// (the newest one unless `contagem` names another of this place).
// Database errors are not swallowed: a broken database must not look like a missing page.
const fetchContagemPage = createServerFn()
  .inputValidator(PageInput)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicLocations, loadPublicCountDetail } = await import("@ameciclo/db");
    return withDb(async (db) => {
      const [location] = await loadPublicLocations(db, { localId: data.id });
      if (!location) return null;
      const selected = location.counts.find((c) => c.id === data.contagem) ?? location.counts[0];
      const detail = await loadPublicCountDetail(db, selected.id);
      return { location, selected, detail };
    });
  });

const fetchAllLocations = createServerFn().handler(async () => {
  const { withDb } = await import("~/lib/db.server");
  const { loadPublicLocations } = await import("@ameciclo/db");
  return withDb((db) => loadPublicLocations(db));
});

const CoverSchema = z.object({ cover: z.object({ url: z.string().nullish() }).nullish() });

// The cover is decoration: a CMS outage should not take the page down.
const fetchPageCover = createServerFn().handler(async () => {
  try {
    const res = await cmsFetch<unknown>(COUNTINGS_PAGE_DATA, { ttl: 300, timeout: 5000 });
    const parsed = CoverSchema.safeParse(res && typeof res === "object" && "data" in res ? res.data : null);
    return parsed.success ? (parsed.data.cover?.url ?? null) : null;
  } catch (error) {
    console.error("Error fetching contagens cover:", error);
    return null;
  }
});

export const contagemPageQueryOptions = (id: number, contagem?: number) =>
  queryOptions({
    queryKey: ["dados", "contagens", "page", id, contagem ?? null],
    queryFn: () => fetchContagemPage({ data: { id, contagem } }),
  });

export const contagensLocationsQueryOptions = () =>
  queryOptions({ queryKey: ["dados", "contagens", "locations"], queryFn: () => fetchAllLocations() });

export const contagensCoverQueryOptions = () =>
  queryOptions({ queryKey: ["dados", "contagens", "cover"], queryFn: () => fetchPageCover() });
