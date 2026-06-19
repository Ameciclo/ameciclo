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

export const Route = createFileRoute("/dados/infracoes/rua/$identifier")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(infracoesQueryOptions()),
  head: ({ params }) =>
    seo({
      title: `Infrações por Rua — Ameciclo`,
      description: "Análise das infrações de trânsito registradas nesta via no Recife.",
      pathname: `/dados/infracoes/rua/${params.identifier}`,
    }),
  component: StreetPage,
  pendingComponent: () => <RouteLoading label="Carregando dados da rua..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function StreetPage() {
  const { identifier: identifierParam } = Route.useParams();
  const slug = decodeURIComponent(identifierParam);
  const streetCode = slug.split("-")[0];
  const streetLabel = slug.includes("-") ? slug.slice(slug.indexOf("-") + 1).replace(/-/g, " ") : `Rua #${streetCode}`;
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { overview, apiDown } = data;

  const filter: InfracoesFilter = { type: "street_code", value: streetCode, label: streetLabel };

  const { data: filteredData } = useQuery(infracoesFilteredQueryOptions(filter));

  useReportApiErrors(data);
  const display = filteredData ?? data;
  const displayName = filteredData?.streetOfficialName || streetLabel;
  const streetTotal = display.overview.totalViolations;
  const extensionKm = filteredData?.streetExtensionKm ?? 0;
  const streetPct = overview.totalViolations > 0 ? ((streetTotal / overview.totalViolations) * 100).toFixed(1) : "0.0";

  const fmtDate = (d: string) => {
    const parts = (d ?? "").slice(0, 10).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const monthCount = (() => {
    const s = overview.periodStart?.slice(0, 10);
    const e = overview.periodEnd?.slice(0, 10);
    if (!s || !e) return 1;
    const [sy, sm] = s.split("-").map(Number);
    const [ey, em] = e.split("-").map(Number);
    if (!sy || !ey) return 1;
    return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  })();
  const monthlyAverage = Math.round(streetTotal / monthCount);

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb
        label={displayName}
        slug={`/dados/infracoes/rua/${identifierParam}`}
        routes={["/", "/dados", "/dados/infracoes"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title={`Infrações na ${displayName}`}
        subtitle=""
        boxes={[
          {
            title: "Total de infrações",
            value: filteredData ? streetTotal.toLocaleString("pt-BR") : "—",
            unit: `${fmtDate(display.overview.periodStart)} a ${fmtDate(display.overview.periodEnd)}`,
          },
          {
            title: "Extensão da via",
            value: filteredData && extensionKm > 0 ? `${extensionKm.toFixed(1)} km` : "—",
            unit: "quilômetros",
          },
          {
            title: "Infrações por mês",
            value: filteredData ? monthlyAverage.toLocaleString("pt-BR") : "—",
            unit: `em ${monthCount} meses`,
          },
          {
            title: "% da base total",
            value: filteredData ? `${streetPct}%` : "—",
            unit: "das autuações",
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
      />
    </>
  );
}
