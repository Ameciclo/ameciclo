import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { COUNTINGS_PAGE_DATA } from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

const fetchContagemSlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const fetchLocationData = async (locationId: string) => {
      const id = Number(locationId);
      if (!Number.isInteger(id)) return null;
      try {
        const { withDb } = await import("~/lib/db.server");
        const { loadPublicLocations } = await import("@ameciclo/db");
        const [location] = await withDb((db) => loadPublicLocations(db, { localId: id }));
        return location ? { ...location, selectedCount: location.counts[0] } : null;
      } catch (error) {
        console.error("Error fetching location data:", error);
        return null;
      }
    };

    const fetchPageData = async () => {
      try {
        const pageDataRes = await cmsFetch<any>(COUNTINGS_PAGE_DATA, { ttl: 300, timeout: 5000 });
        const { withDb } = await import("~/lib/db.server");
        const { loadPublicLocations } = await import("@ameciclo/db");
        const locationsRes = await withDb((db) => loadPublicLocations(db));

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
