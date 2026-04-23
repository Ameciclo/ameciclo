import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { sinistrosFataisQueryOptions } from "~/queries/dados.sinistros-fatais";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/sinistrosfatais/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sinistrosFataisQueryOptions()),
  head: () =>
    seo({
      title: "Sinistros Fatais - Observatório de Segurança Viária - Ameciclo",
      description:
        "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária no Recife e Região Metropolitana.",
      pathname: "/dados/sinistrosfatais",
    }),
  component: SinistrosFataisPage,
  pendingComponent: () => <RouteLoading label="Carregando sinistros fatais..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function SinistrosFataisPage() {
  const { data } = useSuspenseQuery(sinistrosFataisQueryOptions());
  const { summary, citiesByYear, pageData, apiDown } = data;
  useReportApiErrors(data);

  return (
    <>
      <Banner
        title={pageData.title}
        image={pageData.coverImage}
      />
      <Breadcrumb
        label="Observatório de Sinistros Fatais"
        slug="/dados/sinistros-fatais"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />

      <SinistrosFataisClientSide
        summaryData={summary}
        citiesByYearData={citiesByYear}
        pageData={pageData}
      />
    </>
  );
}
