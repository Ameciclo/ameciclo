import { defer } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { DATASUS_SUMMARY_DATA, DATASUS_CITIES_BY_YEAR_DATA, OBSERVATORIO_SINISTROS_PAGE_DATA } from "~/servers";

export async function loader() {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };
  
  const pageData = {
    id: 4,
    title: "Observatório de Sinistros Fatais",
    coverImage: "/pages_covers/sinistros-fatais.png",
    explanationBoxes: [],
    supportFiles: []
  };

  const [summary, citiesByYear, pageDataResult] = await Promise.all([
    fetchWithTimeout(
      DATASUS_SUMMARY_DATA, 
      {}, 
      10000, 
      null, 
      onError(DATASUS_SUMMARY_DATA),
      2
    ),
    fetchWithTimeout(
      DATASUS_CITIES_BY_YEAR_DATA, 
      {}, 
      10000, 
      null, 
      onError(DATASUS_CITIES_BY_YEAR_DATA),
      2
    ),
    fetchWithTimeout(
      OBSERVATORIO_SINISTROS_PAGE_DATA, 
      {}, 
      10000, 
      pageData, 
      onError(OBSERVATORIO_SINISTROS_PAGE_DATA),
      2
    )
  ]);

  return defer({
    summary: Promise.resolve(summary),
    citiesByYear: Promise.resolve(citiesByYear),
    pageData: Promise.resolve(pageDataResult),
    apiDown: errors.length > 0,
    apiErrors: errors,
  });
}