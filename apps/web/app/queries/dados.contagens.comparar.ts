import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MAX_COMPARE, MIN_COMPARE } from "~/components/Contagens/comparison/constants";

const CompareInput = z.object({ slugs: z.array(z.string().min(1)).min(MIN_COMPARE).max(MAX_COMPARE) });

// The counts of a comparison, in the order asked, each with its hourly detail, in one
// database connection. loadPublicCountPage only sees published counts, so a draft or an
// unknown slug makes the whole comparison null (a 404). Slugs that resolve to the same
// count are collapsed.
const fetchContagensCompare = createServerFn()
  .inputValidator(CompareInput)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicCountPage } = await import("@ameciclo/db");
    return withDb(async (db) => {
      const pages = await Promise.all(data.slugs.map((slug) => loadPublicCountPage(db, slug)));
      if (pages.some((page) => page === null)) return null;
      const found = pages.filter((page) => page !== null);
      return [...new Map(found.map((page) => [page.canonical, page])).values()];
    });
  });

export const contagensCompareQueryOptions = (slugs: readonly string[]) =>
  queryOptions({
    queryKey: ["dados", "contagens", "comparar", ...slugs],
    queryFn: () => fetchContagensCompare({ data: { slugs: [...slugs] } }),
  });
