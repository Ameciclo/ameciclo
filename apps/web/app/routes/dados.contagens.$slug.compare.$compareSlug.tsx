import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CountsComparison } from "~/components/Contagens/CountsComparison";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { contagemCompareQueryOptions } from "~/queries/dados.contagens.$slug.compare.$compareSlug";
import { contagensCoverQueryOptions, contagensLocationsQueryOptions } from "~/queries/dados.contagens.$slug";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/contagens/$slug/compare/$compareSlug")({
  loader: async ({ context: { queryClient }, params }) => {
    const [places] = await Promise.all([
      queryClient.ensureQueryData(contagemCompareQueryOptions(params.slug, params.compareSlug)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!places) throw notFound();
  },
  head: ({ params }) =>
    seo({
      title: "Comparação de Contagens - Ameciclo",
      description:
        "Comparação entre contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: `/dados/contagens/${params.slug}/compare/${params.compareSlug}`,
      noindex: true,
    }),
  component: Compare,
  pendingComponent: () => <RouteLoading label="Carregando comparação..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Compare() {
  const params = Route.useParams();
  const { data: places } = useSuspenseQuery(contagemCompareQueryOptions(params.slug, params.compareSlug));
  const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
  const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
  if (!places) throw notFound();

  return (
    <CountsComparison
      places={places}
      cover={cover}
      locations={locations}
      title="Comparação entre Contagens"
      subtitle="Análise comparativa dos dados de contagem de ciclistas"
      crumb="Comparação"
    />
  );
}
