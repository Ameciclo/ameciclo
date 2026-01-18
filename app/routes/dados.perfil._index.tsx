import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import PerfilDashboard from "~/components/Perfil/PerfilDashboard";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useEffect } from "react";

import { loader } from "~/loader/dados.perfil";
export { loader };

export default function perfil() {
    const { cover, description, objective, profileData, apiDown, apiErrors } = useLoaderData<typeof loader>();
    const { setApiDown, addApiError } = useApiStatus();

    useEffect(() => {
        setApiDown(apiDown);
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/perfil');
            });
        }
    }, [apiDown, apiErrors, setApiDown, addApiError]);

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