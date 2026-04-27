import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  COUNTINGS_ATLAS_LOCATION,
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { contagemSlug } from "~/utils/slugify";

const fetchContagemSlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const fetchLocationData = async (locationId: string, countId?: string) => {
      const URL = COUNTINGS_ATLAS_LOCATION(locationId);
      try {
        const d = await cmsFetch<any>(URL, { ttl: 60, timeout: 5000 });
        if (!d) return null;

        if (countId && d.counts) {
          const specificCount = d.counts.find(
            (c: any) => c.id.toString() === countId
          );
          if (specificCount) {
            return { ...d, selectedCount: specificCount };
          }
        }

        if (d.counts && d.counts.length > 0) {
          return { ...d, selectedCount: d.counts[0] };
        }

        return d;
      } catch (error) {
        console.error("Error fetching location data:", error);
        return null;
      }
    };

    const fetchPageData = async () => {
      try {
        const [pageDataRes, locationsRes] = await Promise.all([
          cmsFetch<any>(COUNTINGS_PAGE_DATA, { ttl: 300, timeout: 5000 }),
          cmsFetch<any>(COUNTINGS_ATLAS_LOCATIONS, {
            ttl: 300,
            timeout: 5000,
            fallback: [],
          }),
        ]);

        return {
          pageCover: pageDataRes?.data || null,
          otherCounts: locationsRes || [],
        };
      } catch (error) {
        console.error("Error fetching page data:", error);
        return { pageCover: null, otherCounts: [] };
      }
    };

    const isNumeric = /^\d+$/.test(data.slug);

    if (isNumeric) {
      const [locationData, pageData] = await Promise.all([
        fetchLocationData(data.slug),
        fetchPageData(),
      ]);
      return { data: locationData, pageData };
    }

    // Slug textual: buscar todas as locations e encontrar match
    const pageData = await fetchPageData();
    const locations: any[] = pageData.otherCounts || [];

    for (const loc of locations) {
      if (loc.counts && Array.isArray(loc.counts)) {
        for (const count of loc.counts) {
          if (contagemSlug(count.date, loc.name) === data.slug) {
            const locationData = await fetchLocationData(
              loc.id.toString(),
              count.id.toString()
            );
            return { data: locationData, pageData };
          }
        }
      }
    }

    return { data: null, pageData };
  });

export const contagemSlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", slug],
    queryFn: () => fetchContagemSlug({ data: { slug } }),
  });
