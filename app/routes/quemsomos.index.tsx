import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import { QuemSomosContent } from "~/components/QuemSomos/QuemSomosContent";
import { quemSomosQueryOptions } from "~/queries/quemsomos";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/quemsomos/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(quemSomosQueryOptions()),
  head: () =>
    seo({
      title: "Quem Somos - Ameciclo",
      description:
        "Conheça a Ameciclo — Associação Metropolitana de Ciclistas do Recife: missão, história e equipe.",
      pathname: "/quemsomos",
    }),
  component: QuemSomos,
});

function QuemSomos() {
  const { data } = useSuspenseQuery(quemSomosQueryOptions());
  const { pageData } = data;
  useReportApiErrors(data);

  return (
    <>
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
