import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { loader as compareContagensLoader } from "~/loader/compareContagensLoader";
import { COUNTINGS_ATLAS_LOCATION, COUNTINGS_ATLAS_LOCATIONS, COUNTINGS_PAGE_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const fetchLocationData = async (locationId: string) => {
    try {
      const data = await fetchWithTimeout(COUNTINGS_ATLAS_LOCATION(locationId), { cache: "no-cache" }, 5000, null);
      if (!data) return null;
      
      // Usar a contagem mais recente
      if (data.counts && data.counts.length > 0) {
        return { ...data, selectedCount: data.counts[0] };
      }
      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  };

  const fetchData = async () => {
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

  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam, compareSlugParam].filter(Boolean);
  
  const dataPromise = Promise.all(
    toCompare.map(async (locationId) => {
      const result = await fetchLocationData(locationId);
      return result;
    })
  );

  const pageDataPromise = fetchData();
  const boxesPromise = compareContagensLoader({ params }).then(result => result.json());

  return defer({ 
    dataPromise, 
    pageDataPromise, 
    boxesPromise, 
    toCompare 
  });
};