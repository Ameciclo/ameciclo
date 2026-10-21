import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { COUNTINGS_ATLAS_LOCATION } from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

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
    const data = await cmsFetch<any>(COUNTINGS_ATLAS_LOCATION(locationId), {
      ttl: 60,
      timeout: 5000,
    });
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

export const fetchCompareContagens = createServerFn()
  .inputValidator((input: { slug: string; compareSlug: string }) => input)
  .handler(async ({ data }) => {
    const slugParam = data.slug || "";
    const compareSlugParam = data.compareSlug || "";
    const toCompare = [slugParam, compareSlugParam].filter(Boolean);

    const result = await Promise.all(
      toCompare.map(async (locationId) => {
        const r = await fetchLocationData(locationId);
        return r;
      })
    );

    const boxes = getBoxesForCountingComparision(result.filter(Boolean));

    return { boxes };
  });

export const compareContagensQueryOptions = (slug: string, compareSlug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compareLoader", slug, compareSlug],
    queryFn: () => fetchCompareContagens({ data: { slug, compareSlug } }),
  });
