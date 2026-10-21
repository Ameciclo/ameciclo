import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { METRICS, type PublicCount } from "@ameciclo/db/shared";
import type { PcrCounting } from "typings";
import { cmsFetch } from "~/services/cmsFetch";
import { countNote } from "~/services/counting-details.service";
import { IntlPercentil } from "~/services/utils";
import { strapiClient } from "~/lib/strapi";

// Ameciclo's own counts come from the contagens database. When it is unreachable
// the page falls back to the existing "data unavailable" state.
async function loadAmecicloLocations() {
  try {
    const { withDb } = await import("~/lib/db.server");
    const { loadPublicLocations } = await import("@ameciclo/db");
    return await withDb((db) => loadPublicLocations(db));
  } catch (error) {
    console.error("Error loading contagens from the database:", error);
    return null;
  }
}

const PCR_CONTAGENS_URL = "https://ameciclo.org/dbs/PCR_CONTAGENS.json";

const MediaSchema = z.object({
  id: z.number().nullish(),
  url: z.string().nullish(),
  alternativeText: z.string().nullish(),
});

const ArchiveSchema = z.object({
  id: z.number().nullish(),
  filename: z.string().nullish(),
  description: z.string().nullish(),
  image: MediaSchema.nullish(),
  file: MediaSchema.nullish(),
});

const ContagemPageSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  description: z.string().nullish(),
  objective: z.string().nullish(),
  methodology: z.string().nullish(),
  overal_report: z.string().nullish(),
  cover: MediaSchema.nullish(),
  archives: z.array(ArchiveSchema).nullish(),
});

export type CountsSummary = {
  total_cyclists: number;
  number_counts: number;
  different_counts_points: number;
  where_max_count: { total_cyclists: number };
  total_women: number;
  total_juveniles: number;
  total_ride: number;
  total_helmet: number;
  total_service: number;
  total_cargo: number;
  total_shared_bike: number;
  total_sidewalk: number;
  total_wrong_way: number;
};

export type ContagemPage = z.infer<typeof ContagemPageSchema>;
export type ContagemArchive = z.infer<typeof ArchiveSchema>;

const fetchContagens = createServerFn().handler(async () => {
  // Strapi page metadata: strapiClient + Zod.
  // PCR feed: cached at the edge with a timeout (it is a slow static file).
  // Ameciclo's counts come from the database.
  const [pageRes, pcrCounts, locations] = await Promise.all([
    strapiClient.single("contagem").find({
      populate: ["cover", "archives", "archives.image", "archives.file"],
    }),
    cmsFetch<PcrCounting[]>(PCR_CONTAGENS_URL, { ttl: 3600, timeout: 15000, fallback: [] }).catch((error) => {
      console.error("Error fetching PCR_CONTAGENS.json:", error);
      return [];
    }),
    loadAmecicloLocations(),
  ]);

  const page = ContagemPageSchema.parse(pageRes.data);
  const counts = (locations ?? []).flatMap((l) => l.counts);

  const total = (pick: (c: PublicCount) => number) => counts.reduce((sum, c) => sum + pick(c), 0);
  const totalCyclists = total((c) => c.total_cyclists);
  const byMetric = Object.fromEntries(METRICS.map((m) => [m.key, total((c) => c.characteristics[m.key])]));

  const summaryData: CountsSummary = {
    total_cyclists: totalCyclists,
    number_counts: counts.length,
    different_counts_points: locations?.length ?? 0,
    where_max_count: { total_cyclists: Math.max(0, ...counts.map((c) => c.total_cyclists)) },
    total_women: byMetric.women,
    total_juveniles: byMetric.juveniles,
    total_ride: byMetric.ride,
    total_helmet: byMetric.helmet,
    total_service: byMetric.service,
    total_cargo: byMetric.cargo,
    total_shared_bike: byMetric.shared_bike,
    total_sidewalk: byMetric.sidewalk,
    total_wrong_way: byMetric.wrong_way,
  };

  const cards =
    totalCyclists > 0
      ? METRICS.filter((m) => m.card).map((m) => ({
          label: m.label,
          icon: m.icon,
          data: IntlPercentil(byMetric[m.key] / totalCyclists),
        }))
      : [];

  const countsData = (locations ?? []).flatMap((l) =>
    l.counts.map((c) => ({
      id: l.id,
      name: l.name,
      date: c.date,
      total_cyclists: c.total_cyclists,
      note: countNote(c),
    })),
  );

  return {
    page,
    summaryData: { summaryData, countsData, cards },
    pcrCounts,
    amecicloData: locations,
    atlasApiDown: locations == null,
  };
});

export const contagensQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "contagens"],
    queryFn: () => fetchContagens(),
  });
