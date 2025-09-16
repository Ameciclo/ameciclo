import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { loader as compareContagensLoader } from "~/loader/compareContagensLoader";

const COUNTINGS_SUMMARY_DATA = "http://api.garfo.ameciclo.org/cyclist-counts";
const COUNTINGS_DATA = "http://api.garfo.ameciclo.org/cyclist-counts/edition";
const COUNTINGS_PAGE_DATA = "https://cms.ameciclo.org/contagens";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const fetchUniqueData = async (slug: string) => {
    const id = slug.split("-")[0];
    const URL = COUNTINGS_DATA + "/" + id;
    const res = await fetch(URL, { cache: "no-cache" });
    const responseJson = await res.json();
    return responseJson;
  };

  const fetchData = async () => {
    const dataRes = await fetch(COUNTINGS_SUMMARY_DATA, { cache: "no-cache" });
    const dataJson = await dataRes.json();
    const otherCounts = dataJson.counts;

    const pageDataRes = await fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" });
    const pageCover = await pageDataRes.json();
    return { pageCover, otherCounts };
  };

  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam].concat(compareSlugParam.split("_COMPARE_")).filter(Boolean);
  
  const dataPromise = Promise.all(
    toCompare.map(async (d) => {
      const result = await fetchUniqueData(d);
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