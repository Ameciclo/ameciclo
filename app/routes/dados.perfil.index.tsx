import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import PerfilDashboard from "~/components/Perfil/PerfilDashboard";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { perfilQueryOptions } from "~/queries/dados.perfil";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/perfil/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(perfilQueryOptions()),
  head: () =>
    seo({
      title: "Perfil do Ciclista - Ameciclo",
      description:
        "Pesquisa de perfil do ciclista: dados socioeconômicos, percepções e hábitos de quem pedala no Recife.",
      pathname: "/dados/perfil",
    }),
  component: PerfilPage,
  pendingComponent: () => <RouteLoading label="Carregando perfil do ciclista..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function PerfilPage() {
    const { data } = useSuspenseQuery(perfilQueryOptions());
    const { cover, description, objective, profileData, apiDown } = data;
    useReportApiErrors(data);

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de Perfil do Ciclista" />
            <Breadcrumb label="perfil" slug="/perfil" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <ExplanationBoxes
                boxes={[
                    {
                        title: "O que é?",
                        description: description,
                    },
                    {
                        title: "Para o que serve?",
                        description: objective,
                    },
                ]}
            />
            <PerfilDashboard apiDown={apiDown} profileData={profileData} />
        </>
    );
}
