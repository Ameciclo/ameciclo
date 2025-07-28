import { defer, LoaderFunction } from "@remix-run/node";
import { IntlPercentil } from "~/services/utils";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { CountEditionSummary } from "typings";
import * as fs from "fs/promises";
import * as path from "path";

export const loader: LoaderFunction = async () => {
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

  const dataPromise = fetchWithTimeout(
    "https://cms.ameciclo.org/contagens", 
    { cache: "no-cache" },
    5000,
    { cover: null, description: "Dados de contagens", objective: "Monitorar fluxo de ciclistas", archives: [], counts: [] }
  );
  
  const summaryDataPromise = fetchWithTimeout(
    "http://api.garfo.ameciclo.org/cyclist-counts",
    { cache: "no-cache" },
    5000,
    { summary: { total_cyclists: 0, total_women: 0, total_juveniles: 0, total_cargo: 0, total_helmet: 0, total_ride: 0, total_service: 0, total_shared_bike: 0, total_sidewalk: 0, total_wrong_way: 0, total_motor: 0 }, counts: [] }
  ).then(data => {
    const summaryData = data?.summary || {};
    const countsData = data?.counts || [];
    const cards = CardsData(summaryData);
    return { summaryData, countsData, cards };
  });

  const pcrCountsPromise = (async () => {
    try {
      const jsonPath = path.join(process.cwd(), "public", "dbs", "PCR_CONTAGENS.json");
      const fileContent = await fs.readFile(jsonPath, "utf-8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("Error reading PCR_CONTAGENS.json:", error);
      return [];
    }
  })();

  return defer({
    dataPromise,
    summaryDataPromise,
    pcrCountsPromise,
  });
};
