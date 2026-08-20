import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { InfracoesStatisticsBox } from "~/components/Infracoes/InfracoesStatisticsBox";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesOverviewQueryOptions, type InfracoesFilter } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import { formatCompactParts } from "~/utils/formatNumber";
import { slugToCategory } from "~/components/Infracoes/InfracoesClientSide";

export const Route = createFileRoute("/dados/infracoes/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: search.category as string | undefined,
    law: search.law as string | undefined,
    street_code: search.street_code as string | undefined,
  }),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(infracoesQueryOptions()),
  head: () =>
    seo({
      title: "Observatório de Infrações de Trânsito - Ameciclo",
      description: "Análise das infrações de trânsito registradas no Recife.",
      pathname: "/dados/infracoes",
    }),
  component: InfracoesPage,
  pendingComponent: () => <RouteLoading label="Carregando dados de infrações..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function InfracoesPage() {
  const { data: ssrData } = useSuspenseQuery(infracoesQueryOptions());
  const { data: overviewData } = useQuery(ssrData.overviewDeferred ? infracoesOverviewQueryOptions() : ({ queryKey: ["skip-overview"], queryFn: () => null, enabled: false } as any));

  const overviewDataMerged = overviewData ?? {};
  const data = ssrData;
  const pageData = data.pageData;
  const apiDown = data.apiDown;
  const overview = ssrData.overviewDeferred && overviewData ? overviewDataMerged.overview ?? ssrData.overview : ssrData.overview;
  const temporal = ssrData.overviewDeferred && overviewData ? overviewDataMerged.temporal ?? ssrData.temporal : ssrData.temporal;
  const categoryBreakdown = ssrData.overviewDeferred && overviewData ? overviewDataMerged.categoryBreakdown ?? ssrData.categoryBreakdown : ssrData.categoryBreakdown;
  const categories = ssrData.overviewDeferred && overviewData ? overviewDataMerged.categories ?? ssrData.categories : ssrData.categories;
  const statisticsBoxes = ssrData.overviewDeferred && overviewData ? overviewDataMerged.statisticsBoxes ?? ssrData.statisticsBoxes : ssrData.statisticsBoxes;
  const agentBreakdownByYear = ssrData.overviewDeferred && overviewData ? overviewDataMerged.agentBreakdownByYear ?? ssrData.agentBreakdownByYear : ssrData.agentBreakdownByYear;
  const categoryBreakdownByYear = ssrData.overviewDeferred && overviewData ? overviewDataMerged.categoryBreakdownByYear ?? ssrData.categoryBreakdownByYear : ssrData.categoryBreakdownByYear;
  const violationCodes = ssrData.violationCodes;

  const compactBoxes = useMemo(() =>
    (statisticsBoxes || []).map((box: any) =>
      typeof box.value === "number"
        ? { ...box, ...formatCompactParts(box.value) }
        : box
    ),
    [statisticsBoxes]
  );

  const [InfracoesComponent, setInfracoesComponent] = useState<any>(null);
  useEffect(() => {
    import("~/components/Infracoes/InfracoesClientSide").then((mod) => {
      setInfracoesComponent(() => mod.default);
    });
  }, []);

  const clientSideProps = {
    overview, violationCodes, categories, temporal,
    categoryBreakdown, agentBreakdownByYear, categoryBreakdownByYear,
    filter: null, filterLoading: false,
  };

  return (
    <>
      <Banner image={pageData.coverImage} alt="Infrações" />
      <Breadcrumb label="Observatório de Infrações" slug="/dados/infracoes" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={apiDown} />
      <InfracoesStatisticsBox title="Observatório de Infrações de Trânsito" subtitle="Estatísticas gerais" boxes={compactBoxes} />
      <ExplanationBoxes boxes={pageData.explanationBoxes} />
      {InfracoesComponent ? (
        <InfracoesComponent {...clientSideProps} />
      ) : (
        <div className="py-12 text-center text-gray-500">Carregando visualizações...</div>
      )}
    </>
  );
}

function FilteredStatisticsBox({ filter, filteredData, overview, unfilteredStats }: {
  filter: InfracoesFilter;
  filteredData: any;
  overview: any;
  unfilteredStats: any;
}) {
  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  if (filter.type === "street_code") {
    const name = filteredData?.streetOfficialName || filter.label;
    const total = filteredData?.overview?.totalViolations ?? 0;
    const ext = filteredData?.streetExtensionKm ?? 0;
    const monthCount = (() => {
      const s = unfilteredStats.overview.periodStart?.slice(0, 10);
      const e = unfilteredStats.overview.periodEnd?.slice(0, 10);
      if (!s || !e) return 1;
      const [sy, sm] = s.split("-").map(Number);
      const [ey, em] = e.split("-").map(Number);
      if (!sy || !ey) return 1;
      return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
    })();
    return (
      <InfracoesStatisticsBox
        title={`Infrações na ${name}`}
        subtitle=""
        boxes={[
          { title: "Total de infrações", ...(filteredData ? formatCompactParts(total) : { value: "—", suffix: "" }), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
          { title: "Extensão da via", value: filteredData && ext > 0 ? `${ext.toFixed(1)} km` : "—", unit: "quilômetros" },
          { title: "Infrações por mês", ...(filteredData ? formatCompactParts(Math.round(total / monthCount)) : { value: "—", suffix: "" }), unit: `em ${monthCount} meses` },
          { title: "% da base total", value: filteredData && overview.totalViolations > 0 ? `${((total / overview.totalViolations) * 100).toFixed(1)}%` : "—", unit: "das autuações" },
        ]}
      />
    );
  }

  if (filter.type === "law") {
    const total = filteredData?.overview?.totalViolations ?? 0;
    return (
      <InfracoesStatisticsBox
        title={`Infrações: ${filter.label}`}
        subtitle={`${formatCompactNumber(total)} infrações registradas`}
        boxes={[
          { title: "Total de infrações", ...(filteredData ? formatCompactParts(total) : { value: "—", suffix: "" }), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
          { title: "Artigos do CTB", value: filteredData ? formatFullNumber(filteredData.lawCodes?.length ?? 0) : "—", unit: "incisos e variações" },
          { title: "% da base total", value: filteredData && overview.totalViolations > 0 ? `${((total / overview.totalViolations) * 100).toFixed(1)}%` : "—", unit: "das autuações" },
          { title: "Total geral", ...formatCompactParts(overview.totalViolations), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
        ]}
      />
    );
  }

  const catStats = unfilteredStats.categoryBreakdown?.find((c: any) => c.category === filter.label);
  const catMonthCount = (() => {
    const s = unfilteredStats.overview.periodStart?.slice(0, 10);
    const e = unfilteredStats.overview.periodEnd?.slice(0, 10);
    if (!s || !e) return 1;
    const [sy, sm] = s.split("-").map(Number);
    const [ey, em] = e.split("-").map(Number);
    if (!sy || !ey) return 1;
    return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  })();
  return (
    <InfracoesStatisticsBox
      title={`Infrações: ${filter.label}`}
      subtitle="Análise aprofundada das autuações desta classificação"
      boxes={[
        { title: "Total de infrações", ...(catStats ? formatCompactParts(catStats.total) : { value: "—", suffix: "" }), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
        { title: "Artigos do CTB", value: catStats ? formatFullNumber(catStats.topViolations.length) : "—", unit: "tipos de infração" },
        { title: "Média mensal", ...(catStats ? formatCompactParts(Math.round(catStats.total / catMonthCount)) : { value: "—", suffix: "" }), unit: `infrações/mês em ${catMonthCount} meses` },
        { title: "% da base total", value: catStats ? `${catStats.percentage.toFixed(1)}%` : "—", unit: "das autuações" },
        { title: "Total geral", ...formatCompactParts(overview.totalViolations), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
      ]}
    />
  );
}
