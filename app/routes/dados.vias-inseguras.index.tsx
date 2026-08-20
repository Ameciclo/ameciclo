import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import ViasInsegurasClientSide from "~/components/ViasInseguras/ViasInsegurasClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { viasInsegurasQueryOptions } from "~/queries/dados.vias-inseguras";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/vias-inseguras/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(viasInsegurasQueryOptions()),
  head: () =>
    seo({
      title: "Observatório de Vias Inseguras - Ameciclo",
      description:
        "Ranking das vias com maior concentração de sinistros de trânsito no Recife, baseado nos dados de chamados de emergência.",
      pathname: "/dados/vias-inseguras",
    }),
  component: ViasInsegurasPage,
  pendingComponent: () => <RouteLoading label="Carregando vias inseguras..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function ViasInsegurasPage() {
  const { data } = useSuspenseQuery(viasInsegurasQueryOptions());
  const {
    pageData,
    statisticsBoxes,
    summaryData,
    topViasData,
    mapData,
    apiDown,
  } = data;

  useReportApiErrors(data);

  return (
    <>
      <Banner
        image={pageData.coverImage}
        alt="Capa da página do Observatório de Vias Inseguras"
      />
      <Breadcrumb
        label="Observatório de Vias Inseguras"
        slug="/dados/vias-inseguras"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title="Observatório de Vias Inseguras"
        subtitle="Estatísticas gerais dos sinistros por via no Recife"
        boxes={statisticsBoxes}
      />
      <ExplanationBoxes
        boxes={pageData.explanationBoxes}
      />
      <ViasInsegurasClientSide
        summaryData={summaryData}
        topViasData={topViasData}
        mapData={mapData}
      />
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
