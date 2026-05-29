import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { parseCountIdFromSlug } from "~/services/slug";

function findLocationByCountId(locations: any[], countId: string) {
  for (const loc of locations || []) {
    if (loc.counts) {
      const match = loc.counts.find(
        (c: any) => c.id.toString() === countId,
      );
      if (match) {
        return { ...loc, selectedCount: match };
      }
    }
  }
  return null;
}

function getBoxes(data: any[]) {
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

const fetchCompare = createServerFn()
  .inputValidator((input: { slugs: string }) => input)
  .handler(async ({ data }) => {
    const slugs = data.slugs.split("&").filter(Boolean);
    const countIds = slugs.map((s) => parseCountIdFromSlug(s)).filter(Boolean);

    const [pageDataRes, locationsRes] = await Promise.all([
      cmsFetch<any>(COUNTINGS_PAGE_DATA, { ttl: 300, timeout: 5000 }),
      cmsFetch<any>(COUNTINGS_ATLAS_LOCATIONS, {
        ttl: 300,
        timeout: 5000,
        fallback: [],
      }),
    ]);

    const otherCounts = locationsRes || [];

    const locations = countIds
      .map((id) => findLocationByCountId(otherCounts, id))
      .filter(Boolean);

    const boxes = getBoxes(locations);

    return {
      data: locations,
      pageData: {
        pageCover: pageDataRes?.data || null,
        otherCounts,
      },
      boxes: { boxes },
      toCompare: slugs,
      slugs,
    };
  });

export const contagemCompareQueryOptions = (slugs: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compare", slugs],
    queryFn: () => fetchCompare({ data: { slugs } }),
  });
