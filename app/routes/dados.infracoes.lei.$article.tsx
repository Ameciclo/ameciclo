import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesFilteredQueryOptions, type InfracoesFilter } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import InfracoesClientSide from "~/components/Infracoes/InfracoesClientSide";

export const Route = createFileRoute("/dados/infracoes/lei/$article")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(infracoesQueryOptions()),
  head: ({ params }) => {
    const article = decodeURIComponent(params.article);
    return seo({
      title: `${article} — Infrações de Trânsito - Ameciclo`,
      description: `Análise das infrações relacionadas ao ${article} do CTB registradas no Recife.`,
      pathname: `/dados/infracoes/lei/${params.article}`,
    });
  },
  component: LawPage,
  pendingComponent: () => <RouteLoading label="Carregando dados da lei..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function LawPage() {
  const { article: articleParam } = Route.useParams();
  const article = decodeURIComponent(articleParam);
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { overview, apiDown } = data;

  const filter: InfracoesFilter = { type: "law", value: article, label: article };

  const { data: filteredData } = useQuery(infracoesFilteredQueryOptions(filter));

  useReportApiErrors(data);
  const display = filteredData ?? data;
  const lawTotal = display.overview.totalViolations;
  const lawPct = overview.totalViolations > 0 ? ((lawTotal / overview.totalViolations) * 100).toFixed(1) : "0.0";

  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb label={article} slug={`/dados/infracoes/lei/${articleParam}`} routes={["/", "/dados", "/dados/infracoes"]} />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title={`Infrações: ${article}`}
        subtitle={`${lawTotal.toLocaleString("pt-BR")} infrações registradas`}
        boxes={[
          {
            title: "Total de infrações",
            value: filteredData ? lawTotal.toLocaleString("pt-BR") : "—",
            unit: `${fmtDate(display.overview.periodStart)} a ${fmtDate(display.overview.periodEnd)}`,
          },
          {
            title: "Artigos do CTB",
            value: filteredData ? (filteredData.lawCodes?.length ?? 0).toLocaleString("pt-BR") : "—",
            unit: "incisos e variações",
          },
          {
            title: "% da base total",
            value: filteredData ? `${lawPct}%` : "—",
            unit: "das autuações",
          },
          {
            title: "Total geral",
            value: overview.totalViolations.toLocaleString("pt-BR"),
            unit: `${fmtDate(display.overview.periodStart)} a ${fmtDate(display.overview.periodEnd)}`,
          },
        ]}
      />
      <InfracoesClientSide
        overview={display.overview}
        violationCodes={display.violationCodes}
        categories={display.categories}
        temporal={display.temporal}
        categoryBreakdown={display.categoryBreakdown}
        agentBreakdownByYear={display.agentBreakdownByYear}
        categoryBreakdownByYear={display.categoryBreakdownByYear}
        filter={filter}
        lawCodes={filteredData?.lawCodes}
      />
    </>
  );
}
