import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import SEO from "~/components/Commom/SEO";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { QuemSomosContent } from "~/components/QuemSomos/QuemSomosContent";
import { quemSomosQueryOptions } from "~/loader/quemsomos";

export const Route = createFileRoute("/quemsomos/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(quemSomosQueryOptions()),
  head: () => ({
    meta: [{ title: "Quem Somos" }],
  }),
  component: QuemSomos,
});

function QuemSomos() {
  const { data: { pageData, apiErrors } } = useSuspenseQuery(quemSomosQueryOptions());
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
