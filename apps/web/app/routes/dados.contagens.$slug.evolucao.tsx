import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CountsComparison } from "~/components/Contagens/CountsComparison";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { contagemEvolutionQueryOptions } from "~/queries/dados.contagens.$slug.evolucao";
import { contagensCoverQueryOptions, contagensLocationsQueryOptions } from "~/queries/dados.contagens.$slug";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/contagens/$slug/evolucao")({
  loader: async ({ context: { queryClient }, params }) => {
    const [places] = await Promise.all([
      queryClient.ensureQueryData(contagemEvolutionQueryOptions(params.slug)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!places || places.length === 0) throw notFound();
  },
  head: ({ params }) =>
    seo({
      title: "Evolução de um ponto de contagem - Ameciclo",
      description: "Todas as contagens de ciclistas realizadas pela Ameciclo em um mesmo ponto, lado a lado.",
      pathname: `/dados/contagens/${params.slug}/evolucao`,
      noindex: true,
    }),
  component: Evolution,
  pendingComponent: () => <RouteLoading label="Carregando evolução..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Evolution() {
  const { slug } = Route.useParams();
  const { data: places } = useSuspenseQuery(contagemEvolutionQueryOptions(slug));
  const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
  const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
  if (!places || places.length === 0) throw notFound();

  const { name } = places[0].location;
  return (
    <CountsComparison
      places={places}
      cover={cover}
      locations={locations}
      title={`Evolução: ${name}`}
      subtitle={`${places.length} contagens neste ponto, da mais antiga à mais recente`}
      crumb="Evolução"
    />
  );
}
