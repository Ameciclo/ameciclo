import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { InfracoesStatisticsBox } from "~/components/Infracoes/InfracoesStatisticsBox";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesLawStatsQueryOptions, infracoesStreetStatsQueryOptions, type InfracoesFilter } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import { formatCompactParts, formatCompactNumber, formatFullNumber } from "~/utils/formatNumber";
import { slugToCategory } from "~/components/Infracoes/InfracoesClientSide";
import InfracoesClientSide from "~/components/Infracoes/InfracoesClientSide";

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
  const { category, law, street_code: streetCode } = Route.useSearch();
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { pageData, overview, violationCodes, categories, statisticsBoxes, apiDown, temporal, categoryBreakdown, agentBreakdownByYear, categoryBreakdownByYear } = data;
  useReportApiErrors(data);

  const compactBoxes = useMemo(() =>
    statisticsBoxes.map((box: any) =>
      typeof box.value === "number"
        ? { ...box, ...formatCompactParts(box.value) }
        : box
    ),
    [statisticsBoxes]
  );

  const filter: InfracoesFilter | undefined = category
    ? { type: "category", value: slugToCategory(category, categories.map((c: any) => c.name)), label: slugToCategory(category, categories.map((c: any) => c.name)) }
    : law
      ? { type: "law", value: decodeURIComponent(law), label: decodeURIComponent(law).split(",")[0].trim() }
      : streetCode
        ? { type: "street_code", value: streetCode, label: `Rua #${streetCode}` }
        : undefined;

  const isCategoryFilter = filter?.type === "category";

  const { data: filteredData, isFetching: filterLoading } = useQuery(
    filter?.type === "street_code" ? infracoesStreetStatsQueryOptions(filter) : ({ queryKey: ["skip"], queryFn: () => null, enabled: false } as any)
  );

  const { data: lawStatsData, isFetching: lawStatsLoading } = useQuery(
    filter?.type === "law" ? infracoesLawStatsQueryOptions(filter) : ({ queryKey: ["skip-law"], queryFn: () => null, enabled: false } as any)
  );

  const display = useMemo(() => {
    if (filter?.type === "law") return (lawStatsData as any) ?? data;
    if (filter?.type === "street_code") return (filteredData as any) ?? data;
    if (!isCategoryFilter || !filter) return data;

    const cat = (data as any).categoryBreakdown?.find((c: any) => c.category === filter.value);
    if (!cat) return data;

    const availableYears = Object.keys(temporal.by_year ?? {})
      .map(Number)
      .filter((y) => !isNaN(y) && (temporal.by_year[y] ?? 0) > 0)
      .sort((a, b) => b - a);
    const latestYear = availableYears[0];

    const catByYear: Record<string, number> = {};
    for (const y of (cat.by_year ?? [])) {
      if (y.year) catByYear[String(y.year)] = y.count ?? 0;
    }

    const agentBreakdown = latestYear
      ? (agentBreakdownByYear as any[]).find((e: any) => e.year === latestYear)?.agents ?? overview.agentBreakdown
      : overview.agentBreakdown;

    const filteredCatByYear = (categoryBreakdownByYear as any[]).map((y: any) => ({
      ...y,
      categories: y.categories.filter((c: any) => c.category === filter.value),
    })).filter((y: any) => y.categories.length > 0);

    return {
      ...data,
      overview: { ...overview, totalViolations: cat.total, agentBreakdown },
      temporal: {
        by_year: catByYear,
        by_month_raw: cat.by_month_raw ?? [],
        by_weekday_raw: cat.by_weekday_raw ?? [],
        by_hour_raw: cat.by_hour_raw ?? [],
      },
      categoryBreakdown: [cat],
      categoryBreakdownByYear: filteredCatByYear,
    };
  }, [filter, isCategoryFilter, data, filteredData, temporal, overview, agentBreakdownByYear, categoryBreakdownByYear]);

  const displayFilter = useMemo(() => {
    if (!filter) return undefined;
    if (filter.type === "street_code" && (filteredData as any)?.streetOfficialName) {
      return { ...filter, label: (filteredData as any).streetOfficialName };
    }
    return filter;
  }, [filter, filteredData]);

  const isLoading = filter?.type === "law" ? lawStatsLoading : filterLoading;
  const effectiveFiltered = filter?.type === "law" ? (lawStatsData as any) : (filteredData as any);

  return (
    <>
      <Banner image={pageData.coverImage} alt="Infrações" />
      <Breadcrumb label="Observatório de Infrações" slug="/dados/infracoes" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={apiDown} />
      {displayFilter ? (
        <FilteredStatisticsBox
          filter={displayFilter}
          filteredData={isCategoryFilter ? (display as any) : effectiveFiltered}
          overview={overview}
          unfilteredStats={data}
        />
      ) : (
        <>
          <InfracoesStatisticsBox title="Observatório de Infrações de Trânsito" subtitle="Estatísticas gerais" boxes={compactBoxes} />
          <ExplanationBoxes
            boxes={pageData.explanationBoxes}
          />
        </>
      )}
      <InfracoesClientSide
        overview={display.overview}
        violationCodes={displayFilter?.type === "law" && lawStatsData ? (lawStatsData as any).lawCodes ?? display.violationCodes : display.violationCodes}
        categories={display.categories}
        temporal={display.temporal}
        categoryBreakdown={display.categoryBreakdown}
        agentBreakdownByYear={display.agentBreakdownByYear}
        categoryBreakdownByYear={display.categoryBreakdownByYear}
        filter={displayFilter ?? null}
        lawCodes={(lawStatsData as any)?.lawCodes ?? (filteredData as any)?.lawCodes}
        lawStats={(lawStatsData as any)?.lawStats}
        filterLoading={!isCategoryFilter && isLoading}
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
