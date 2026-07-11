import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { fetchCompareContagens } from "~/queries/compareContagensLoader";
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
    const countA = parseCountIdFromSlug(data.slug || "");
    const countB = parseCountIdFromSlug(data.compareSlug || "");
    const toCompare = [countA, countB].filter(Boolean);

    const [pageData, comparison] = await Promise.all([
      fetchPageData(),
      fetchCompareContagens({ data: { slug: data.slug, compareSlug: data.compareSlug } }),
    ]);

    const locations = toCompare
      .map((id) => findLocationByCountId(pageData.otherCounts, id))
      .filter(Boolean);

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
