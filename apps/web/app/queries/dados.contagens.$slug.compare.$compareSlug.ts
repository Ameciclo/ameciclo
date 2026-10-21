import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CompareInput = z.object({
  slug: z.number().int().positive(),
  compareSlug: z.number().int().positive(),
});

// The newest count of two places with its hourly detail, in one database connection.
const fetchContagemCompare = createServerFn()
  .inputValidator(CompareInput)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicLocations, loadPublicCountDetail } = await import("@ameciclo/db");
    return withDb(async (db) => {
      const places = [];
      for (const id of [data.slug, data.compareSlug]) {
        const [location] = await loadPublicLocations(db, { localId: id });
        if (!location) return null;
        const selected = location.counts[0];
        places.push({ location, selected, detail: await loadPublicCountDetail(db, selected.id) });
      }
      return places;
    });
  });

export const contagemCompareQueryOptions = (slug: number, compareSlug: number) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compare", slug, compareSlug],
    queryFn: () => fetchContagemCompare({ data: { slug, compareSlug } }),
  });
