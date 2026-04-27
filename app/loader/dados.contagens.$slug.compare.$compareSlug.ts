import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { loader as compareContagensLoader } from "~/loader/compareContagensLoader";
import { COUNTINGS_ATLAS_LOCATION, COUNTINGS_ATLAS_LOCATIONS, COUNTINGS_PAGE_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { contagemSlug } from "~/utils/slugify";

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

const fetchPageData = async () => {
  try {
    const [pageDataRes, locationsRes] = await Promise.all([
      fetchWithTimeout(COUNTINGS_PAGE_DATA, { cache: "no-cache" }, 5000, null),
      fetchWithTimeout(COUNTINGS_ATLAS_LOCATIONS, { cache: "no-cache" }, 5000, [])
    ]);
    return {
      pageCover: pageDataRes?.data || null,
      otherCounts: locationsRes || []
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return { pageCover: null, otherCounts: [] };
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

  const pageDataPromise = fetchPageData();
  const pageData = await pageDataPromise;
  const locations: any[] = pageData.otherCounts || [];

  const dataPromise = Promise.all(
    toCompare.map(async (slug) => {
      const resolved = resolveSlug(slug, locations);
      if (!resolved) return null;
      return fetchLocationData(resolved.locationId, resolved.countId);
    })
  );

  const boxesPromise = compareContagensLoader({ params }).then(result => result.json());

  return defer({
    dataPromise,
    pageDataPromise: pageData,
    boxesPromise,
    toCompare
  });
};
