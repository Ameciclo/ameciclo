import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  COUNTINGS_ATLAS_LOCATION,
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

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

    const locationId = data.slug;
    const [locationData, pageData] = await Promise.all([
      fetchLocationData(locationId),
      fetchPageData(),
    ]);

    return { data: locationData, pageData };
  });

export const contagemSlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", slug],
    queryFn: () => fetchContagemSlug({ data: { slug } }),
  });
