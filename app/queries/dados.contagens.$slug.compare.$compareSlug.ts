import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { fetchCompareContagens } from "~/queries/compareContagensLoader";
import {
  COUNTINGS_ATLAS_LOCATION,
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";

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

    return {
      data: locations,
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
