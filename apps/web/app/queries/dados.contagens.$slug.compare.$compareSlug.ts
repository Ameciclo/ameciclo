import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { fetchCompareContagens } from "~/queries/compareContagensLoader";
import { COUNTINGS_PAGE_DATA } from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

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

const fetchContagemCompare = createServerFn()
  .inputValidator((input: { slug: string; compareSlug: string }) => input)
  .handler(async ({ data }) => {
    const slugParam = data.slug || "";
    const compareSlugParam = data.compareSlug || "";
    const toCompare = [slugParam, compareSlugParam].filter(Boolean);

    const [locations, pageData, comparison] = await Promise.all([
      Promise.all(
        toCompare.map(async (locationId) => {
          const result = await fetchLocationData(locationId);
          return result;
        })
      ),
      fetchPageData(),
      fetchCompareContagens({ data: { slug: data.slug, compareSlug: data.compareSlug } }),
    ]);

    const details = [];
    for (const location of locations) {
      const countId = location?.selectedCount?.id;
      if (countId === undefined) {
        details.push(null);
        continue;
      }
      try {
        const { withDb } = await import("~/lib/db.server");
        const { loadPublicCountDetail } = await import("@ameciclo/db");
        details.push(await withDb((db) => loadPublicCountDetail(db, countId)));
      } catch (error) {
        console.error("Error fetching count detail:", error);
        details.push(null);
      }
    }

    return {
      data: locations,
      details,
      pageData,
      boxes: comparison,
      toCompare,
    };
  });

export const contagemCompareQueryOptions = (slug: string, compareSlug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", "compare", slug, compareSlug],
    queryFn: () => fetchContagemCompare({ data: { slug, compareSlug } }),
  });
