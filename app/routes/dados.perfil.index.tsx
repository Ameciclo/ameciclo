import { createFileRoute } from "@tanstack/react-router";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import PerfilDashboard from "~/components/Perfil/PerfilDashboard";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { loader } from "~/loader/dados.perfil";

export const Route = createFileRoute("/dados/perfil/")({
  loader: () => loader(),
  component: PerfilPage,
});

function PerfilPage() {
    const { cover, description, objective, profileData, apiDown, apiErrors } = Route.useLoaderData();
    useApiStatusHandler(apiDown, apiErrors, '/dados/perfil');

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
