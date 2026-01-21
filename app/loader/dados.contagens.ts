import { json, LoaderFunction } from "@remix-run/node";
import { IntlPercentil } from "~/services/utils";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import * as fs from "fs/promises";
import * as path from "path";
import { COUNTINGS_PAGE_DATA, COUNTINGS_ATLAS_LOCATIONS } from "~/servers";

export const loader: LoaderFunction = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  try {
    const [dataResponse, pcrCounts, atlasData] = await Promise.all([
      fetchWithTimeout(
        COUNTINGS_PAGE_DATA, 
        { cache: "no-cache" },
        5000,
        null,
        onError(COUNTINGS_PAGE_DATA)
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

    const data = dataResponse?.data || { cover: null, description: null, objective: null, archives: [] };
    
    // Calcular estatísticas a partir dos dados do Atlas
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

    const countsData: any[] = [];

    if (atlasData && Array.isArray(atlasData)) {
      differentPoints = atlasData.length;
      
      atlasData.forEach((location: any) => {
        if (location.counts && Array.isArray(location.counts)) {
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
              slug: location.id.toString(),
              date: count.date,
              total_cyclists: cyclists
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

    const cards = totalCyclists > 0 ? [
      { label: "Mulheres", icon: "women", data: IntlPercentil(totalWomen / totalCyclists) },
      { label: "Crianças e Adolescentes", icon: "children", data: IntlPercentil(totalJuveniles / totalCyclists) },
      { label: "Carona", icon: "ride", data: IntlPercentil(totalRide / totalCyclists) },
      { label: "Capacete", icon: "helmet", data: IntlPercentil(totalHelmet / totalCyclists) },
      { label: "Serviço", icon: "service", data: IntlPercentil(totalService / totalCyclists) },
      { label: "Cargueira", icon: "cargo", data: IntlPercentil(totalCargo / totalCyclists) },
      { label: "Compartilhada", icon: "shared_bike", data: IntlPercentil(totalSharedBike / totalCyclists) },
      { label: "Calçada", icon: "sidewalk", data: IntlPercentil(totalSidewalk / totalCyclists) },
      { label: "Contramão", icon: "wrong_way", data: IntlPercentil(totalWrongWay / totalCyclists) },
    ] : [];

    return json({
      data,
      summaryData: { summaryData, countsData, cards },
      pcrCounts,
      amecicloData: atlasData,
      apiDown: errors.length > 0,
      apiErrors: errors
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return json({
      data: { cover: null, description: null, objective: null, archives: [] },
      summaryData: { summaryData: null, countsData: [], cards: [] },
      pcrCounts: [],
      amecicloData: [],
      apiDown: true,
      apiErrors: [{ url: 'COUNTINGS_API', error: errorMessage || 'Erro desconhecido' }]
    });
  }
};
