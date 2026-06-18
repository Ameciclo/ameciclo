import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
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

  const { data: lawData, isFetching: loading } = useQuery(
    infracoesLawQueryOptions({}, article)
  );

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb label={article} slug={`/dados/infracoes/lei/${articleParam}`} routes={["/", "/dados", "/dados/infracoes"]} />
      <ApiStatusHandler apiDown={apiDown} />
      <InfracoesLawClientSide
        article={article}
        lawData={lawData}
        overview={overview}
        loading={loading}
      />
    </>
  );
}
