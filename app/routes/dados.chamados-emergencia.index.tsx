import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import SamuClientSide from "~/components/Samu/SamuClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { samuQueryOptions } from "~/queries/dados.samu";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/chamados-emergencia/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(samuQueryOptions()),
  head: () =>
    seo({
      title: "Chamados de Emergência - Ameciclo",
      description:
        "Detalhamento dos chamados de emergência relacionados a sinistros de trânsito na Região Metropolitana do Recife.",
      pathname: "/dados/chamados-emergencia",
    }),
  component: SamuPage,
  pendingComponent: () => <RouteLoading label="Carregando dados de chamados de emergência..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function SamuPage() {
  const { data } = useSuspenseQuery(samuQueryOptions());
  const {
    pageData,
    documents,
    statisticsBoxes,
    citiesData,
    apiDown,
  } = data;

  useReportApiErrors(data);

  return (
    <>
      <Banner
        image={pageData.coverImage}
        alt="Capa da página de Chamados de Emergência"
      />
      <Breadcrumb
        label="Chamados de Emergência"
        slug="/dados/chamados-emergencia"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title="Chamados de Emergência"
        subtitle="Estatísticas gerais dos sinistros de trânsito"
        boxes={statisticsBoxes}
      />
      <ExplanationBoxes
        boxes={pageData.explanationBoxes}
      />
      <SamuClientSide citiesData={citiesData || { cidades: [], total: 0 }} />
      <CardsSession title={documents.title} cards={documents.cards} />
      {pageData.supportFiles.length > 0 && (
        <CardsSession
          title="Documentos"
          cards={pageData.supportFiles.map((f) => ({
            title: f.title,
            description: f.description,
            src: f.src,
            url: f.url,
          }))}
        />
      )}
    </>
  );
}
