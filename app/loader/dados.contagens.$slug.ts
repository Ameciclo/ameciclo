import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { COUNTINGS_ATLAS_LOCATION, COUNTINGS_ATLAS_LOCATIONS, COUNTINGS_PAGE_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const fetchLocationData = async (locationId: string, countId?: string) => {
        const URL = COUNTINGS_ATLAS_LOCATION(locationId);
        try {
            const data = await fetchWithTimeout(URL, { cache: "no-cache" }, 5000, null);
            if (!data) return null;
            
            // Se countId foi especificado, buscar essa contagem específica
            if (countId && data.counts) {
                const specificCount = data.counts.find((c: any) => c.id.toString() === countId);
                if (specificCount) {
                    return { ...data, selectedCount: specificCount };
                }
            }
            
            // Caso contrário, usar a contagem mais recente (primeira do array)
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

    // params.slug agora é o locationId
    const locationId = params.slug as string;
    const dataPromise = fetchLocationData(locationId);
    const pageDataPromise = fetchPageData();

    return defer({ dataPromise, pageDataPromise });
};