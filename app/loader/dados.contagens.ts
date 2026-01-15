import { json, LoaderFunction } from "@remix-run/node";
import { IntlPercentil } from "~/services/utils";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { CountEditionSummary } from "typings";
import * as fs from "fs/promises";
import * as path from "path";
import { COUNTINGS_PAGE_DATA, COUNTINGS_SUMMARY_DATA, COUNTINGS_ATLAS_LOCATIONS } from "~/servers";

export const loader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const CardsData = (summaryData: CountEditionSummary) => {
    const {
      total_cyclists,
      total_cargo,
      total_helmet,
      total_juveniles,
      total_motor,
      total_ride,
      total_service,
      total_shared_bike,
      total_sidewalk,
      total_women,
      total_wrong_way,
    } = { ...summaryData };

    return [
      {
        label: "Mulheres",
        icon: "women",
        data: IntlPercentil(total_women / total_cyclists),
      },
      {
        label: "Crianças e Adolescentes",
        icon: "children",
        data: IntlPercentil(total_juveniles / total_cyclists),
      },
      {
        label: "Carona",
        icon: "ride",
        data: IntlPercentil(total_ride / total_cyclists),
      },
      {
        label: "Capacete",
        icon: "helmet",
        data: IntlPercentil(total_helmet / total_cyclists),
      },
      {
        label: "Serviço",
        icon: "service",
        data: IntlPercentil(total_service / total_cyclists),
      },
      {
        label: "Cargueira",
        icon: "cargo",
        data: IntlPercentil(total_cargo / total_cyclists),
      },
      {
        label: "Compartilhada",
        icon: "shared_bike",
        data: IntlPercentil(total_shared_bike / total_cyclists),
      },
      {
        label: "Calçada",
        icon: "sidewalk",
        data: IntlPercentil(total_sidewalk / total_cyclists),
      },
      {
        label: "Contramão",
        icon: "wrong_way",
        data: IntlPercentil(total_wrong_way / total_cyclists),
      },
    ];
  };

  try {
    const [data, summaryResult, pcrCounts, amecicloData] = await Promise.all([
      fetchWithTimeout(
        COUNTINGS_PAGE_DATA, 
        { cache: "no-cache" },
        5000,
        null,
        onError(COUNTINGS_PAGE_DATA)
      ),
      fetchWithTimeout(
        COUNTINGS_SUMMARY_DATA,
        { cache: "no-cache" },
        5000,
        null,
        onError(COUNTINGS_SUMMARY_DATA)
      ),
      (async () => {
        try {
          const jsonPath = path.join(process.cwd(), "public", "dbs", "PCR_CONTAGENS.json");
          const fileContent = await fs.readFile(jsonPath, "utf-8");
          return JSON.parse(fileContent);
        } catch (error) {
          console.error("Error reading PCR_CONTAGENS.json:", error);
          return [];
        }
      })(),
      fetchWithTimeout(
        COUNTINGS_ATLAS_LOCATIONS,
        { cache: "no-cache" },
        5000,
        [],
        onError(COUNTINGS_ATLAS_LOCATIONS)
      )
    ]);

    const summaryData = summaryResult?.summary || null;
    const countsData = summaryResult?.counts || [];
    const cards = summaryData ? CardsData(summaryData) : null;

    return json({
      data: data || { cover: null, description: null, objective: null, archives: [], counts: [] },
      summaryData: { summaryData, countsData, cards },
      pcrCounts,
      amecicloData,
      apiDown: errors.length > 0,
      apiErrors: errors
    });
  } catch (error) {
    return json({
      data: { cover: null, description: null, objective: null, archives: [], counts: [] },
      summaryData: { summaryData: null, countsData: [], cards: null },
      pcrCounts: [],
      amecicloData: [],
      apiDown: true,
      apiErrors: [{ url: 'COUNTINGS_API', error: error.message || 'Erro desconhecido' }]
    });
  }
};
