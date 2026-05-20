import { json, LoaderFunctionArgs } from "@remix-run/node";
import { COUNTINGS_ATLAS_LOCATION, COUNTINGS_ATLAS_LOCATIONS } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { contagemSlug } from "~/utils/slugify";

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

const fetchLocationData = async (locationId: string, countId?: string) => {
  try {
    const data = await fetchWithTimeout(COUNTINGS_ATLAS_LOCATION(locationId), { cache: "no-cache" }, 5000, null);
    if (!data) return null;

    if (countId && data.counts) {
      const specificCount = data.counts.find((c: any) => c.id.toString() === countId);
      if (specificCount) return { ...data, selectedCount: specificCount };
    }

    if (data.counts && data.counts.length > 0) {
      return { ...data, selectedCount: data.counts[0] };
    }
    return data;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

const resolveSlug = (slug: string, locations: any[]): { locationId: string; countId?: string } | null => {
  if (/^\d+$/.test(slug)) return { locationId: slug };
  for (const loc of locations) {
    if (loc.counts && Array.isArray(loc.counts)) {
      for (const count of loc.counts) {
        if (contagemSlug(count.date, loc.name) === slug) {
          return { locationId: loc.id.toString(), countId: count.id.toString() };
        }
      }
    }
  }
  return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam, compareSlugParam].filter(Boolean);

  const allLocations = await fetchWithTimeout(COUNTINGS_ATLAS_LOCATIONS, { cache: "no-cache" }, 5000, []);

  const data = await Promise.all(
    toCompare.map(async (slug) => {
      const resolved = resolveSlug(slug, allLocations || []);
      if (!resolved) return null;
      return fetchLocationData(resolved.locationId, resolved.countId);
    })
  );

  const boxes = getBoxesForCountingComparision(data.filter(Boolean));

  return json({ boxes });
};
