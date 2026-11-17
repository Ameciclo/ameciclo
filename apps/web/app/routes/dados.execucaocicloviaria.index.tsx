import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { ExecucaoDocumentos } from "~/components/ExecucaoCicloviaria/ExecucaoDocumentos";
import ExecucaoObservatorio from "~/components/ExecucaoCicloviaria/ExecucaoObservatorio";
import {
  DEFAULT_CITY_IBGE,
  execucaoCicloviariaQueryOptions,
  execucaoCicloviariaWaysQueryOptions,
} from "~/queries/dados.execucaocicloviaria";
import { seo } from "~/utils/seo";

// ?cidade=2611606: the municipality (IBGE code). Anything unknown falls back to Recife.
const SearchSchema = z.object({
  cidade: z.number().int().optional().catch(undefined),
});

export const Route = createFileRoute("/dados/execucaocicloviaria/")({
  validateSearch: SearchSchema,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(execucaoCicloviariaQueryOptions()),
  head: () =>
    seo({
      title: "Execução Cicloviária - Ameciclo",
      description:
        "Quanto do Plano Diretor Cicloviário já saiu do papel: monitoramento das estruturas cicloviárias projetadas e executadas nas cidades da Região Metropolitana do Recife.",
      pathname: "/dados/execucaocicloviaria",
    }),
  component: ExecucaoCicloviaria,
  pendingComponent: () => <RouteLoading label="Carregando execução cicloviária..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function ExecucaoCicloviaria() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(execucaoCicloviariaQueryOptions());
  // The ways come after the page: the numbers do not wait for the map.
  const { data: ways } = useQuery(execucaoCicloviariaWaysQueryOptions());

  const known = (ibge: number | undefined) => data.overview.cities.some((c) => c.ibge === ibge);
  const selectedIbge = known(search.cidade) ? (search.cidade ?? DEFAULT_CITY_IBGE) : DEFAULT_CITY_IBGE;

  return (
    <>
      <Banner image={data.cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
      <Breadcrumb label="Execução Cicloviária" slug="/dados/execucaocicloviaria" routes={["/", "/dados"]} />
      <ExecucaoObservatorio
        title={data.title}
        explanations={data.explanations}
        overview={data.overview}
        projects={data.projects}
        history={data.history}
        ways={ways}
        selectedIbge={selectedIbge}
        // Picking a municipality must not send the page back to the top.
        onSelect={(ibge) => navigate({ search: (prev) => ({ ...prev, cidade: ibge }), resetScroll: false })}
      />
      <ExecucaoDocumentos title={data.documents.title} resources={data.documents.cards} />
    </>
  );
}
