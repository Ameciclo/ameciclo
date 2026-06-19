import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesFilteredQueryOptions, type InfracoesFilter } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
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
  const { overview, violationCodes, categories, statisticsBoxes, apiDown, temporal, categoryBreakdown, agentBreakdownByYear, categoryBreakdownByYear } = data;
  useReportApiErrors(data);

  const filter: InfracoesFilter | undefined = category
    ? { type: "category", value: slugToCategory(category, categories.map((c: any) => c.name)), label: slugToCategory(category, categories.map((c: any) => c.name)) }
    : law
      ? { type: "law", value: decodeURIComponent(law), label: decodeURIComponent(law) }
      : streetCode
        ? { type: "street_code", value: streetCode, label: `Rua #${streetCode}` }
        : undefined;

  const { data: filteredData } = useQuery(
    filter ? infracoesFilteredQueryOptions(filter) : ({ queryKey: ["skip"], queryFn: () => null, enabled: false } as any)
  );

  const display: any = filteredData ?? data;

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb label="Observatório de Infrações" slug="/dados/infracoes" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={apiDown} />
      {filter ? (
        <FilteredStatisticsBox filter={filter} filteredData={filteredData as any} overview={overview} unfilteredStats={display} />
      ) : (
        <>
          <StatisticsBox title="Observatório de Infrações de Trânsito" subtitle="Estatísticas gerais" boxes={statisticsBoxes} />
          <ExplanationBoxes
            boxes={[
              {
                title: "O que mostram esses dados?",
                description: "Analisamos a base de infrações de trânsito registradas no Recife para entender o perfil das autuações. Os dados revelam o que está sendo fiscalizado, não necessariamente tudo o que acontece nas ruas — a presença de fiscalização eletrônica influencia fortemente os números.",
              },
              {
                title: "Por que isso importa?",
                description: "Entender quais infrações são mais registradas, onde e quando ocorrem, e quem as fiscaliza é essencial para avaliar se a política de fiscalização prioriza a segurança de quem anda a pé e de bicicleta ou está concentrada em fluidez e estacionamento.",
              },
            ]}
          />
        </>
      )}
      <InfracoesClientSide
        overview={display.overview}
        violationCodes={filter?.type === "law" && filteredData ? (filteredData as any).lawCodes ?? display.violationCodes : display.violationCodes}
        categories={categories}
        temporal={display.temporal}
        categoryBreakdown={display.categoryBreakdown}
        agentBreakdownByYear={display.agentBreakdownByYear}
        categoryBreakdownByYear={display.categoryBreakdownByYear}
        filter={filter}
        lawCodes={(filteredData as any)?.lawCodes}
      />
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
      <StatisticsBox
        title={`Infrações na ${name}`}
        subtitle=""
        boxes={[
          { title: "Total de infrações", value: filteredData ? total.toLocaleString("pt-BR") : "—", unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
          { title: "Extensão da via", value: filteredData && ext > 0 ? `${ext.toFixed(1)} km` : "—", unit: "quilômetros" },
          { title: "Infrações por mês", value: filteredData ? Math.round(total / monthCount).toLocaleString("pt-BR") : "—", unit: `em ${monthCount} meses` },
          { title: "% da base total", value: filteredData && overview.totalViolations > 0 ? `${((total / overview.totalViolations) * 100).toFixed(1)}%` : "—", unit: "das autuações" },
        ]}
      />
    );
  }

  if (filter.type === "law") {
    const total = filteredData?.overview?.totalViolations ?? 0;
    return (
      <StatisticsBox
        title={`Infrações: ${filter.label}`}
        subtitle={`${total.toLocaleString("pt-BR")} infrações registradas`}
        boxes={[
          { title: "Total de infrações", value: filteredData ? total.toLocaleString("pt-BR") : "—", unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
          { title: "Artigos do CTB", value: filteredData ? (filteredData.lawCodes?.length ?? 0).toLocaleString("pt-BR") : "—", unit: "incisos e variações" },
          { title: "% da base total", value: filteredData && overview.totalViolations > 0 ? `${((total / overview.totalViolations) * 100).toFixed(1)}%` : "—", unit: "das autuações" },
          { title: "Total geral", value: overview.totalViolations.toLocaleString("pt-BR"), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
        ]}
      />
    );
  }

  const catStats = unfilteredStats.categoryBreakdown?.find((c: any) => c.category === filter.label);
  return (
    <StatisticsBox
      title={`Infrações: ${filter.label}`}
      subtitle="Análise aprofundada das autuações desta classificação"
      boxes={[
        { title: "Total de infrações", value: catStats ? catStats.total.toLocaleString("pt-BR") : "—", unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
        { title: "Artigos do CTB", value: catStats ? catStats.topViolations.length.toLocaleString("pt-BR") : "—", unit: "tipos de infração" },
        { title: "% da base total", value: catStats ? `${catStats.percentage.toFixed(1)}%` : "—", unit: "das autuações" },
        { title: "Total geral", value: overview.totalViolations.toLocaleString("pt-BR"), unit: `${fmtDate(unfilteredStats.overview.periodStart)} a ${fmtDate(unfilteredStats.overview.periodEnd)}` },
      ]}
    />
  );
}
