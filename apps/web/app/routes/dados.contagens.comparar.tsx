import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CountsComparison } from "~/components/Contagens/CountsComparison";
import { isComparable, parseCompareParam } from "~/components/Contagens/comparison/selection";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { contagensCompareQueryOptions } from "~/queries/dados.contagens.comparar";
import { contagensCoverQueryOptions, contagensLocationsQueryOptions } from "~/queries/dados.contagens.$slug";
import { seo } from "~/utils/seo";

// `?c=<slug>&c=<slug>...`: the counts to compare, the first one being the baseline.
const SearchSchema = z.object({ c: z.unknown().transform(parseCompareParam) });

export const Route = createFileRoute("/dados/contagens/comparar")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ c: search.c }),
  loader: async ({ context: { queryClient }, deps }) => {
    // Too few or too many counts: nothing to compare, send people back to choose.
    if (!isComparable(deps.c.length)) throw redirect({ to: "/dados/contagens", search: {} });
    const [places] = await Promise.all([
      queryClient.ensureQueryData(contagensCompareQueryOptions(deps.c)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!places) throw notFound();
    if (!isComparable(places.length)) throw redirect({ to: "/dados/contagens", search: {} });
  },
  head: () =>
    seo({
      title: "Comparação de Contagens - Ameciclo",
      description: "Comparação entre contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: "/dados/contagens/comparar",
      noindex: true,
    }),
  component: Compare,
  pendingComponent: () => <RouteLoading label="Carregando comparação..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Compare() {
  const { c } = Route.useSearch();
  const { data: places } = useSuspenseQuery(contagensCompareQueryOptions(c));
  const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
  const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
  if (!places) throw notFound();

  const sameLocation = places.every((p) => p.location.id === places[0].location.id);
  return (
    <CountsComparison
      places={places}
      cover={cover}
      locations={locations}
      title="Comparação entre Contagens"
      subtitle={
        sameLocation
          ? `${places.length} contagens de ${places[0].location.name}, na ordem escolhida`
          : `${places.length} contagens, na ordem escolhida: a primeira é a base das variações`
      }
      crumb="Comparação"
    />
  );
}
