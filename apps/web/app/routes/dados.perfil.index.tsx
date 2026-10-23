import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import PerfilDashboard from "~/components/Perfil/PerfilDashboard";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { perfilQueryOptions } from "~/queries/dados.perfil";
import { seo } from "~/utils/seo";

// ?cidade=Recife&ano=2024. Anything unknown falls back to Recife's latest survey.
const SearchSchema = z.object({
  cidade: z.string().optional().catch(undefined),
  ano: z.number().int().optional().catch(undefined),
});

export const Route = createFileRoute("/dados/perfil/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ cidade: search.cidade, ano: search.ano }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(perfilQueryOptions(deps.cidade, deps.ano)),
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
  const { cidade, ano } = Route.useSearch();
  const navigate = Route.useNavigate();
  const {
    data: { page, surveys, cube, dataUnavailable },
  } = useSuspenseQuery(perfilQueryOptions(cidade, ano));

  return (
    <>
      <Banner image={page.cover?.url ?? undefined} alt="Capa da página de Perfil do Ciclista" />
      <Breadcrumb label="perfil" slug="/perfil" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={dataUnavailable} />
      <ExplanationBoxes
        boxes={[
          { title: "O que é?", description: page.description ?? null },
          { title: "Para o que serve?", description: page.objective ?? null },
        ]}
      />
      <PerfilDashboard
        surveys={surveys}
        cube={cube}
        onSelect={(survey) => navigate({ search: { cidade: survey.city, ano: survey.year } })}
      />
    </>
  );
}
