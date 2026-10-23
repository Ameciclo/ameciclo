import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import PerfilExplorer from "~/components/Perfil/PerfilExplorer";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { perfilDataQueryOptions, perfilPageQueryOptions } from "~/queries/dados.perfil";
import { seo } from "~/utils/seo";

// ?cidade=Recife&ano=2024. Anything unknown falls back to Recife's latest survey.
const SearchSchema = z.object({
  cidade: z.string().optional().catch(undefined),
  ano: z.number().int().optional().catch(undefined),
  // Which question to show, how to split its answers, and whether to compare with other cities.
  q: z.string().optional().catch(undefined),
  dim: z.enum(["all", "gender", "race"]).optional().catch(undefined),
  nac: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/dados/perfil/")({
  validateSearch: SearchSchema,
  // Only the city drives loading: every edition of it comes in one request,
  // so picking a year just selects among data that is already here.
  loaderDeps: ({ search }) => ({ cidade: search.cidade }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(perfilPageQueryOptions()),
      queryClient.ensureQueryData(perfilDataQueryOptions(deps.cidade)),
    ]),
  head: () =>
    seo({
      title: "Perfil do Ciclista - Ameciclo",
      description:
        "Pesquisa de perfil do ciclista: dados socioeconômicos, percepções e hábitos de quem pedala no Recife e em outras cidades do Brasil.",
      pathname: "/dados/perfil",
    }),
  component: PerfilPage,
  pendingComponent: () => <RouteLoading label="Carregando perfil do ciclista..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function PerfilPage() {
  const { cidade, ano, q, dim, nac } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: page } = useSuspenseQuery(perfilPageQueryOptions());
  const {
    data: { surveys, history, national, dataUnavailable },
  } = useSuspenseQuery(perfilDataQueryOptions(cidade));
  // The requested year, else the city's latest edition.
  const cube = history.find((c) => c.survey.year === ano) ?? history[history.length - 1] ?? null;

  const onSelect = (survey: { city: string; year: number }) =>
    navigate({ search: (prev) => ({ ...prev, cidade: survey.city, ano: survey.year }), resetScroll: false });

  return (
    <>
      <Banner image={page.cover?.url ?? undefined} alt="Capa da página de Perfil do Ciclista" />
      <Breadcrumb label="perfil" slug="/perfil" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={dataUnavailable} />
      <PerfilExplorer
        page={page}
        surveys={surveys}
        cube={cube}
        history={history}
        national={national}
        onSelect={onSelect}
        params={{ q, dim, nac }}
        onParams={(p) => navigate({ search: (prev) => ({ ...prev, ...p }), resetScroll: false, replace: true })}
      />
    </>
  );
}
