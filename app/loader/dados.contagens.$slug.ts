import { defer, LoaderFunctionArgs } from "@remix-run/node";

const COUNTINGS_SUMMARY_DATA = "http://api.garfo.ameciclo.org/cyclist-counts";
const COUNTINGS_DATA = "http://api.garfo.ameciclo.org/cyclist-counts/edition";
const COUNTINGS_PAGE_DATA = "https://cms.ameciclo.org/contagens";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const fetchUniqueData = async (slug: string) => {
        const id = slug.split("-")[0];
        const URL = COUNTINGS_DATA + "/" + id;
        try {
            const res = await fetch(URL, {
                cache: "no-cache",
            });
            if (!res.ok) {
                return null;
            }
            const responseJson = await res.json();
            return responseJson;
        } catch (error) {
            return null;
        }
    };

    const fetchData = async () => {
        let otherCounts = [];
        let pageCover = null;

        try {
            const dataRes = await fetch(COUNTINGS_SUMMARY_DATA, {
                cache: "no-cache",
            });
            if (!dataRes.ok) {
                console.error(`Error fetching summary data: ${dataRes.status} ${dataRes.statusText}`);
            } else {
                const dataJson = await dataRes.json();
                otherCounts = dataJson.counts || [];
            }
        } catch (error) {
            console.error("Error in fetchData (summary data):", error);
        }

        try {
            const pageDataRes = await fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" });
            if (!pageDataRes.ok) {
                console.error(`Error fetching page data: ${pageDataRes.status} ${pageDataRes.statusText}`);
            } else {
                pageCover = await pageDataRes.json();
            }
        } catch (error) {
            console.error("Error in fetchData (page data):", error);
        }
        return { pageCover, otherCounts };
    };

    const dataPromise = fetchUniqueData(params.slug as string);
    const pageDataPromise = fetchData();

    return defer({ dataPromise, pageDataPromise });
};