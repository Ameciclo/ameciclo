import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EvolutionInput = z.object({ slug: z.string().min(1) });

// Every published count of a place, oldest first, each with its hourly detail. The slug
// names the place or any of its counts.
const fetchContagemEvolution = createServerFn()
  .inputValidator(EvolutionInput)
  .handler(async ({ data }) => {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicCountPage } = await import("@ameciclo/db");
    const { contagemSlug } = await import("@ameciclo/db/slug");
    return withDb(async (db) => {
      const first = await loadPublicCountPage(db, data.slug);
      if (!first) return null;
      const oldestFirst = [...first.location.counts].sort((a, b) => a.date.localeCompare(b.date));
      const pages = await Promise.all(
        oldestFirst.map((count) => loadPublicCountPage(db, contagemSlug(first.location.slug, count))),
      );
      return pages.filter((page) => page !== null);
    });
  });

export const contagemEvolutionQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "evolucao", slug],
    queryFn: () => fetchContagemEvolution({ data: { slug } }),
  });
