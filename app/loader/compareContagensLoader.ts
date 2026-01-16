import { json, LoaderFunctionArgs } from "@remix-run/node";
import { COUNTINGS_ATLAS_LOCATION } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

function getBoxesForCountingComparision(data: any[]) {
  const boxes = data.map((location) => {
    const count = location.selectedCount || location.counts?.[0] || {};
    const chars = count.characteristics || {};
    const totalCyclists = count.total_cyclists || 0;
    
    const parameters = [
      { titulo: "Total", media: totalCyclists, mediaType: "number", total: totalCyclists },
      { titulo: "Cargueira", media: chars.cargo || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Capacete", media: chars.helmet || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Juvenis", media: chars.juveniles || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Motor", media: chars.motor || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Carona", media: chars.ride || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Serviço", media: chars.service || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Bike Compartilhada", media: chars.shared_bike || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Calçada", media: chars.sidewalk || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Mulheres", media: chars.women || 0, mediaType: "number", total: totalCyclists },
      { titulo: "Contramão", media: chars.wrong_way || 0, mediaType: "number", total: totalCyclists },
    ];
    
    return {
      titulo: location.name,
      value: totalCyclists,
      date: count.date,
      parametros: parameters,
    };
  });
  return boxes;
}

const fetchLocationData = async (locationId: string) => {
  try {
    const data = await fetchWithTimeout(COUNTINGS_ATLAS_LOCATION(locationId), { cache: "no-cache" }, 5000, null);
    if (!data) return null;
    
    if (data.counts && data.counts.length > 0) {
      return { ...data, selectedCount: data.counts[0] };
    }
    return data;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam, compareSlugParam].filter(Boolean);

  const data = await Promise.all(
    toCompare.map(async (locationId) => {
      const result = await fetchLocationData(locationId);
      return result;
    })
  );

  const boxes = getBoxesForCountingComparision(data.filter(Boolean));

  return json({ boxes });
};