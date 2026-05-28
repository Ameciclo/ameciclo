import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { parseCountIdFromSlug } from "~/services/slug";

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

export const fetchCompareContagens = createServerFn()
  .inputValidator((input: { slug: string; compareSlug: string }) => input)
  .handler(async ({ data }) => {
    const countA = parseCountIdFromSlug(data.slug || "");
    const countB = parseCountIdFromSlug(data.compareSlug || "");

    const [pageDataRes, locationsRes] = await Promise.all([
      cmsFetch<any>(COUNTINGS_PAGE_DATA, { ttl: 300, timeout: 5000 }),
      cmsFetch<any>(COUNTINGS_ATLAS_LOCATIONS, {
        ttl: 300,
        timeout: 5000,
        fallback: [],
      }),
    ]);

    const otherCounts = locationsRes || [];

    const results = [countA, countB]
      .filter(Boolean)
      .map((id) => findLocationByCountId(otherCounts, id))
      .filter(Boolean);

    const boxes = getBoxesForCountingComparision(results);

    return { boxes };
  });

export const compareContagensQueryOptions = (slug: string, compareSlug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compareLoader", slug, compareSlug],
    queryFn: () => fetchCompareContagens({ data: { slug, compareSlug } }),
  });
