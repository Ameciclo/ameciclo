import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

import SEO from "~/components/Commom/SEO";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { QuemSomosContent } from "~/components/QuemSomos/QuemSomosContent";
import { loader } from "~/loader/quemsomos";
export { loader };

export const meta: MetaFunction = () => {
  return [{ title: "Quem Somos" }];
};
export default function QuemSomos() {
  const { pageData, apiErrors } = useLoaderData<typeof loader>();
  const { addApiError } = useApiStatus();
  
  useEffect(() => {
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/quemsomos');
      });
    }
  }, [apiErrors, addApiError]);

  return (
    <>
      <SEO title="Quem Somos" />
      <div className="relative py-24 w-full h-[52vh]">
        <img
          src="/quem_somos.webp"
          alt="Quem somos?"
          className="absolute inset-0 object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <Breadcrumb label="Quem Somos" slug="/quem_somos" routes={["/"]} />
      <QuemSomosContent pageData={pageData} />
    </>
  );
}
