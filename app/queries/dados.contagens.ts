import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { IntlPercentil } from "~/services/utils";
import { strapiClient } from "~/lib/strapi";
import { cmsFetch } from "~/services/cmsFetch";
import { COUNTINGS_ATLAS_LOCATIONS } from "~/servers";

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

export type ContagemPage = z.infer<typeof ContagemPageSchema>;
export type ContagemArchive = z.infer<typeof ArchiveSchema>;

const fetchContagens = createServerFn().handler(async () => {
  // Strapi page metadata: migrated to strapiClient + Zod.
  // Atlas + PCR feeds: still on cmsFetch / native fetch — their
  // domains don't resolve outside the deployed Worker, so the runtime
  // shape can't be verified locally. Atlas-side schemas are a follow-up
  // (see PR #154's body for the same constraint on dados/perfil).
  const [pageRes, pcrCounts, atlasData] = await Promise.all([
    strapiClient.single("contagem").find({
      populate: ["cover", "archives", "archives.image", "archives.file"],
    }),
    fetch(PCR_CONTAGENS_URL)
      .then((r) => r.json())
      .catch((error) => {
        console.error("Error fetching PCR_CONTAGENS.json:", error);
        return [] as unknown[];
      }),
    cmsFetch<unknown[] | null>(COUNTINGS_ATLAS_LOCATIONS, {
      ttl: 60,
      timeout: 5000,
      fallback: [],
    }),
  ]);

  const page = ContagemPageSchema.parse(pageRes.data);

  let totalCyclists = 0;
  let totalWomen = 0;
  let totalJuveniles = 0;
  let totalRide = 0;
  let totalHelmet = 0;
  let totalService = 0;
  let totalCargo = 0;
  let totalSharedBike = 0;
  let totalSidewalk = 0;
  let totalWrongWay = 0;
  let maxCount = 0;
  let differentPoints = 0;
  let totalCounts = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countsData: any[] = [];

  // Atlas response shape isn't verified from this dev environment yet;
  // the aggregation loop keeps its original `any` annotations. Once the
  // Atlas API is reachable from CI, Zod-parse the response and tighten
  // these locals.
  if (Array.isArray(atlasData)) {
    differentPoints = atlasData.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    atlasData.forEach((location: any) => {
      if (location?.counts && Array.isArray(location.counts)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        location.counts.forEach((count: any) => {
          totalCounts++;
          const cyclists = count.total_cyclists || 0;
          totalCyclists += cyclists;

          if (cyclists > maxCount) maxCount = cyclists;

          const chars = count.characteristics || {};
          totalWomen += chars.women || 0;
          totalJuveniles += chars.juveniles || 0;
          totalRide += chars.ride || 0;
          totalHelmet += chars.helmet || 0;
          totalService += chars.service || 0;
          totalCargo += chars.cargo || 0;
          totalSharedBike += chars.shared_bike || 0;
          totalSidewalk += chars.sidewalk || 0;
          totalWrongWay += chars.wrong_way || 0;

          countsData.push({
            id: location.id,
            name: location.name,
            slug: String(location.id),
            date: count.date,
            total_cyclists: cyclists,
          });
        });
      }
    });
  }

  const summaryData = {
    total_cyclists: totalCyclists,
    number_counts: totalCounts,
    different_counts_points: differentPoints,
    where_max_count: { total_cyclists: maxCount },
    total_women: totalWomen,
    total_juveniles: totalJuveniles,
    total_ride: totalRide,
    total_helmet: totalHelmet,
    total_service: totalService,
    total_cargo: totalCargo,
    total_shared_bike: totalSharedBike,
    total_sidewalk: totalSidewalk,
    total_wrong_way: totalWrongWay,
  };

  const cards =
    totalCyclists > 0
      ? [
          { label: "Mulheres", icon: "women", data: IntlPercentil(totalWomen / totalCyclists) },
          { label: "Crianças e Adolescentes", icon: "children", data: IntlPercentil(totalJuveniles / totalCyclists) },
          { label: "Carona", icon: "ride", data: IntlPercentil(totalRide / totalCyclists) },
          { label: "Capacete", icon: "helmet", data: IntlPercentil(totalHelmet / totalCyclists) },
          { label: "Serviço", icon: "service", data: IntlPercentil(totalService / totalCyclists) },
          { label: "Cargueira", icon: "cargo", data: IntlPercentil(totalCargo / totalCyclists) },
          { label: "Compartilhada", icon: "shared_bike", data: IntlPercentil(totalSharedBike / totalCyclists) },
          { label: "Calçada", icon: "sidewalk", data: IntlPercentil(totalSidewalk / totalCyclists) },
          { label: "Contramão", icon: "wrong_way", data: IntlPercentil(totalWrongWay / totalCyclists) },
        ]
      : [];

  return {
    page,
    summaryData: { summaryData, countsData, cards },
    pcrCounts,
    amecicloData: atlasData,
    atlasApiDown: atlasData == null,
  };
});

export const contagensQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "contagens"],
    queryFn: () => fetchContagens(),
  });
