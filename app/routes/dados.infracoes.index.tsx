import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import InfracoesClientSide from "~/components/Infracoes/InfracoesClientSide";

export const Route = createFileRoute("/dados/infracoes/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(infracoesQueryOptions()),
  head: () =>
    seo({
      title: "Observatório de Infrações de Trânsito - Ameciclo",
      description:
        "Análise das infrações de trânsito registradas no Recife.",
      pathname: "/dados/infracoes",
    }),
  component: InfracoesPage,
  pendingComponent: () => <RouteLoading label="Carregando dados de infrações..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function InfracoesPage() {
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { overview, violationCodes, categories, statisticsBoxes, apiDown, temporal, categoryBreakdown, agentBreakdownByYear, categoryBreakdownByYear } = data;
  useReportApiErrors(data);
  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb label="Observatório de Infrações" slug="/dados/infracoes" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox title="Observatório" subtitle="Visão geral" boxes={statisticsBoxes} />
      <ExplanationBoxes
        boxes={[
          {
            title: "O que mostram esses dados?",
            description:
              "Analisamos a base de infrações de trânsito registradas no Recife para entender o perfil das autuações. Os dados revelam o que está sendo fiscalizado, não necessariamente tudo o que acontece nas ruas — a presença de fiscalização eletrônica influencia fortemente os números.",
          },
          {
            title: "Por que isso importa?",
            description:
              "Entender quais infrações são mais registradas, onde e quando ocorrem, e quem as fiscaliza é essencial para avaliar se a política de fiscalização prioriza a segurança de quem anda a pé e de bicicleta ou está concentrada em fluidez e estacionamento.",
          },
        ]}
      />
      <InfracoesClientSide
        overview={overview}
        violationCodes={violationCodes}
        categories={categories}
        temporal={temporal}
        categoryBreakdown={categoryBreakdown}
        agentBreakdownByYear={agentBreakdownByYear}
        categoryBreakdownByYear={categoryBreakdownByYear}
      />
    </>
  );
}
