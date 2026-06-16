import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesLawQueryOptions } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import InfracoesLawClientSide from "~/components/Infracoes/InfracoesLawClientSide";

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

  useReportApiErrors(data);

  const availableYears = useMemo(() => {
    const start = parseInt(overview.periodStart?.slice(0, 4));
    const end = parseInt(overview.periodEnd?.slice(0, 4));
    if (!start || !end) return [];
    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);
    return years;
  }, [overview.periodStart, overview.periodEnd]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const dateParams = useMemo((): Record<string, string> => {
    return selectedYear === null
      ? { start_date: overview.periodStart.slice(0, 10), end_date: overview.periodEnd.slice(0, 10) }
      : { start_date: `${selectedYear}-01-01`, end_date: `${selectedYear}-12-31` };
  }, [selectedYear, overview.periodStart, overview.periodEnd]);

  const { data: lawData, isFetching: loading } = useQuery(
    infracoesLawQueryOptions(dateParams, article)
  );

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações de Trânsito" />
      <Breadcrumb label={article} slug={`/dados/infracoes/lei/${articleParam}`} routes={["/", "/dados", "/dados/infracoes"]} />
      <ApiStatusHandler apiDown={apiDown} />
      <InfracoesLawClientSide
        article={article}
        lawData={lawData}
        overview={overview}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        loading={loading}
      />
    </>
  );
}
