import { createFileRoute } from "@tanstack/react-router";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { DocumentsSession } from "~/components/Documentos/DocumentsSession";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { useSuspenseQuery } from "@tanstack/react-query";
import { documentosQueryOptions } from "~/queries/dados.documentos";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/documentos/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(documentosQueryOptions()),
  head: () =>
    seo({
      title: "Documentos - Ameciclo",
      description:
        "Estudos, pesquisas, livros e relatórios produzidos pela Ameciclo ou em parcerias sobre mobilidade ativa e cicloativismo.",
      pathname: "/dados/documentos",
    }),
  component: Documentos,
});

function Documentos() {
    const { data } = useSuspenseQuery(documentosQueryOptions());
    const { cover, description, objectives, documents, apiDown } = data;
    useReportApiErrors(data);

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
