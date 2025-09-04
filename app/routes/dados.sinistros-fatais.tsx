import { Suspense } from "react";
import { useLoaderData, Await } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { loader } from "~/loader/dados.sinistros-fatais";
export { loader };



export default function SinistrosFataisPage() {
  const { summary, citiesByYear, pageData } = useLoaderData<typeof loader>();
  
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