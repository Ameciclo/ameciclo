import { defer, LoaderFunctionArgs } from "@remix-run/node";
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const slug = params.slug as string;
    const isNumeric = /^\d+$/.test(slug);

    if (isNumeric) {
        const dataPromise = fetchLocationData(slug);
        const pageDataPromise = fetchPageData();
        return defer({ dataPromise, pageDataPromise });
    }

    // Slug textual: buscar locations para resolver o slug
    const pageData = await fetchPageData();
    const locations: any[] = pageData.otherCounts || [];

    for (const loc of locations) {
        if (loc.counts && Array.isArray(loc.counts)) {
            for (const count of loc.counts) {
                if (contagemSlug(count.date, loc.name) === slug) {
                    const dataPromise = fetchLocationData(loc.id.toString(), count.id.toString());
                    return defer({ dataPromise, pageDataPromise: pageData });
                }
            }
        }
    }

    return defer({ dataPromise: null, pageDataPromise: pageData });
};
