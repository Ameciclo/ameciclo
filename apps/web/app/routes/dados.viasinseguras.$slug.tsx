import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import ViaPagina from "~/components/ViasInseguras/ViaPagina";
import { viaQueryOptions } from "~/queries/dados.vias-inseguras";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/viasinseguras/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    const { via, unavailable } = await queryClient.ensureQueryData(viaQueryOptions(params.slug));
    // Banco fora do ar não é "via inexistente": deixa o erro aparecer em vez de um 404 enganoso.
    if (!via && !unavailable) throw notFound();
    if (unavailable) throw new Error("Os dados das vias inseguras não estão disponíveis agora.");
    return { name: via?.street.name ?? "" };
  },
  head: ({ loaderData }) =>
    seo({
      title: `${loaderData?.name ?? "Via"} - Vias Inseguras - Ameciclo`,
      description: `Chamados do SAMU por sinistro de trânsito em ${loaderData?.name ?? "uma via do Recife"}: quantos, em que anos e de que tipo.`,
      pathname: `/dados/viasinseguras/${loaderData ? encodeURIComponent(loaderData.name) : ""}`,
    }),
  component: ViaRoute,
  pendingComponent: () => <RouteLoading label="Carregando a via..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function ViaRoute() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(viaQueryOptions(slug));
  if (!data.via) return null;
  return (
    <>
      <Banner image="/pages_covers/vias-inseguras.png" alt="Capa da página do Observatório de Vias Inseguras" />
      <Breadcrumb label={data.via.street.name} slug={`/dados/viasinseguras/${slug}`} routes={["/", "/dados", "/dados/viasinseguras"]} />
      <ViaPagina via={data.via} />
    </>
  );
}
