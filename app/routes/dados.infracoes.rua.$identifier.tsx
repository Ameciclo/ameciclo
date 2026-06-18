import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { infracoesQueryOptions, infracoesStreetQueryOptions } from "~/queries/dados.infracoes";
import { seo } from "~/utils/seo";
import InfracoesStreetClientSide from "~/components/Infracoes/InfracoesStreetClientSide";

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
  // Extract street code from slug: "11738-avenida-conde-da-boa-vista" -> "11738"
  const streetCode = slug.split("-")[0];
  const { data } = useSuspenseQuery(infracoesQueryOptions());
  const { overview, apiDown } = data;

  useReportApiErrors(data);

  const { data: streetData, isFetching: loading } = useQuery(
    infracoesStreetQueryOptions({}, streetCode)
  );

  return (
    <>
      <Banner image="/pages_covers/infracoes.png" alt="Infrações" />
      <Breadcrumb
        label={streetData?.official_name ?? `Rua #${streetCode}`}
        slug={`/dados/infracoes/rua/${identifierParam}`}
        routes={["/", "/dados", "/dados/infracoes"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <InfracoesStreetClientSide
        streetData={streetData}
        overview={overview}
        streetCode={streetCode}
        loading={loading}
      />
    </>
  );
}
