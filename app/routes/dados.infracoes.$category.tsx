import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import { slugToCategory, categoryColor } from "~/components/Infracoes/InfracoesClientSide";
import InfracoesCategoryClientSide from "~/components/Infracoes/InfracoesCategoryClientSide";

export const Route = createFileRoute("/dados/infracoes/$category")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(infracoesQueryOptions()),
  head: ({ params }) => {
    const categoryName = slugToCategory(params.category);
    return seo({
      title: `${categoryName} — Observatório de Infrações de Trânsito - Ameciclo`,
      description: `Análise aprofundada das infrações de trânsito na categoria "${categoryName}" registradas no Recife.`,
      pathname: `/dados/infracoes/${params.category}`,
    });
  },
  component: InfracoesCategoryPage,
  pendingComponent: () => <RouteLoading label="Carregando dados de infrações..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function InfracoesCategoryPage() {
  const { category } = Route.useParams();
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { overview, categories, apiDown } = data;
  const categoryName = slugToCategory(category);
  const categoryData = categories.find((c: any) => c.name === categoryName);
  const color = categoryColor(categoryName);

  useReportApiErrors(data);

  return (
    <>
      <Banner
        image="/pages_covers/infracoes.png"
        alt="Capa da página do Observatório de Infrações de Trânsito"
      />
      <Breadcrumb
        label={categoryName}
        slug={`/dados/infracoes/${category}`}
        routes={["/", "/dados", "/dados/infracoes"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title={`Infrações: ${categoryName}`}
        subtitle={`Análise aprofundada das autuações desta classificação`}
        boxes={[
          {
            title: "Total de infrações",
            value: categoryData ? categoryData.totalViolations.toLocaleString("pt-BR") : "—",
            unit: `${overview.periodStart} a ${overview.periodEnd}`,
          },
          {
            title: "Artigos do CTB",
            value: categoryData ? categoryData.codeCount.toLocaleString("pt-BR") : "—",
            unit: "tipos de infração",
          },
          {
            title: "% da base total",
            value: categoryData ? `${((categoryData.totalViolations / overview.totalViolations) * 100).toFixed(1)}%` : "—",
            unit: "das autuações",
          },
          {
            title: "Total geral",
            value: overview.totalViolations.toLocaleString("pt-BR"),
            unit: `${overview.periodStart} a ${overview.periodEnd}`,
          },
        ]}
      />
      <InfracoesCategoryClientSide
        categorySlug={category}
        overview={overview}
        color={color}
      />
    </>
  );
}
