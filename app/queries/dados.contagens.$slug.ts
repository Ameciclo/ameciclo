import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  COUNTINGS_ATLAS_LOCATIONS,
  COUNTINGS_PAGE_DATA,
} from "~/servers";
import { cmsFetch } from "~/services/cmsFetch";
import { parseCountIdFromSlug } from "~/services/slug";

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

const fetchContagemSlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const countId = parseCountIdFromSlug(data.slug);
    const pageData = await fetchPageData();

    let locationData = null;
    for (const loc of pageData.otherCounts || []) {
      if (loc.counts) {
        const match = loc.counts.find(
          (c: any) => c.id.toString() === countId,
        );
        if (match) {
          locationData = { ...loc, selectedCount: match };
          break;
        }
      }
    }

    return { data: locationData, pageData };
  });

export const contagemSlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "contagens", slug],
    queryFn: () => fetchContagemSlug({ data: { slug } }),
  });
