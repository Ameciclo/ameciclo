import { createFileRoute } from "@tanstack/react-router";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { DocumentsSession } from "~/components/Documentos/DocumentsSession";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { useSuspenseQuery } from "@tanstack/react-query";
import { documentosQueryOptions } from "~/loader/dados.documentos";

export const Route = createFileRoute("/dados/documentos/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(documentosQueryOptions()),
  component: Documentos,
});

function Documentos() {
    const { data: { cover, description, objectives, documents, apiDown, apiErrors } } = useSuspenseQuery(documentosQueryOptions());
    useApiStatusHandler(apiDown, apiErrors, '/dados/documentos');

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de Documentos" />
            <Breadcrumb label="Documentos" slug="/documentos" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <ExplanationBoxes
                boxes={[
                    {
                        title: "O que acontece por aqui?",
                        description: description
                    },
                    {
                        title: "E o que mais?",
                        description: objectives
                    },
                ]} />
            <DocumentsSession documents={documents} />
        </>
    );
}
