import { Suspense } from "react";
import { useLoaderData, Await } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { loader } from "~/loader/dados.sinistros-fatais";

export { loader };

export default function SinistrosFataisPage() {
  const { summary, citiesByYear, pageData, apiDown, apiErrors } = useLoaderData<typeof loader>();
  useApiStatusHandler(apiDown, apiErrors, '/dados/sinistros-fatais');
  
  return (
    <>
      <Suspense fallback={
        <div className="animate-pulse bg-gray-200 h-64 w-full rounded-lg mb-6"></div>
      }>
        <Await resolve={pageData}>
          {(resolvedPageData) => (
            <>
              <Banner
                title={resolvedPageData.title}
                image={resolvedPageData.coverImage}
              />
              <Breadcrumb
                label="Observatório de Sinistros Fatais"
                slug="/dados/sinistros-fatais"
                routes={["/", "/dados"]}
              />
              <ApiStatusHandler apiDown={apiDown} />
            </>
          )}
        </Await>
      </Suspense>
      
      <Suspense fallback={
        <div className="container mx-auto py-8">
          <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg mb-12"></div>
        </div>
      }>
        <Await resolve={Promise.all([summary, citiesByYear, pageData])}>
          {([resolvedSummary, resolvedCitiesByYear, resolvedPageData]) => (
            <SinistrosFataisClientSide
              summaryData={resolvedSummary} 
              citiesByYearData={resolvedCitiesByYear}
              pageData={resolvedPageData}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}