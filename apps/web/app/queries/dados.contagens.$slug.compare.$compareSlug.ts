import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CompareInput = z.object({ slug: z.string().min(1), compareSlug: z.string().min(1) });

// Two counts with their hourly detail, in one database connection. Each slug names a
// count, or a place (its newest count).
const fetchContagemCompare = createServerFn()
  .inputValidator(CompareInput)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicCountPage } = await import("@ameciclo/db");
    return withDb(async (db) => {
      const places = [];
      for (const segment of [data.slug, data.compareSlug]) {
        const page = await loadPublicCountPage(db, segment);
        if (!page) return null;
        places.push(page);
      }
      return places;
    });
  });

export const contagemCompareQueryOptions = (slug: string, compareSlug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compare", slug, compareSlug],
    queryFn: () => fetchContagemCompare({ data: { slug, compareSlug } }),
  });
