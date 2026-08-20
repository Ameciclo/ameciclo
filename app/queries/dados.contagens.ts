import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { IntlPercentil } from "~/services/utils";
import { cmsFetch } from "~/services/cmsFetch";
import { parsePageData } from "~/services/parsePageData";
import { COUNTINGS_ATLAS_LOCATIONS, PCR_CONTAGENS_URL, PLATAFORMA_DADOS_PAGE_DATA } from "~/servers";
import { slugifyCount } from "~/services/slug";

const FALLBACK_PAGE_DATA = {
  title: "Contagens de Ciclistas",
  coverImage: "/pages_covers/contagens.png",
  explanationBoxes: [
    {
      title: "O que é?",
      description:
        "Contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife, registrando o número de pessoas pedalando e suas características (gênero, idade, uso de capacete, tipo de bicicleta, etc).",
    },
    {
      title: "E o que mais?",
      description:
        "Além das contagens, disponibilizamos documentos e materiais de apoio para quem deseja realizar suas próprias contagens de ciclistas.",
    },
  ],
};

const fetchContagens = createServerFn().handler(async () => {
  const [pageDataResponse, pcrCounts, atlasData] = await Promise.all([
    cmsFetch<any>(PLATAFORMA_DADOS_PAGE_DATA("contagens"), {
      ttl: 600,
      timeout: 5000,
      fallback: null,
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

  const pageData = parsePageData(pageDataResponse, FALLBACK_PAGE_DATA);

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
            slug: slugifyCount(location, count),
            date: count.date,
            total_cyclists: cyclists,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        });
      }
    });
  }

  countsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedCountsData: any[] = [];
  const seen = new Map<number, any>();
  for (const count of countsData) {
    if (!seen.has(count.id)) {
      const parent = { ...count, subRows: [], count_total: 1 };
      seen.set(count.id, parent);
      groupedCountsData.push(parent);
    } else {
      seen.get(count.id)!.subRows.push(count);
      seen.get(count.id)!.count_total++;
    }
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
    pageData,
    summaryData: { summaryData, countsData: groupedCountsData, cards },
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
