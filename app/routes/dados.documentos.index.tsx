import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { DocumentsSession } from "~/components/Documentos/DocumentsSession";
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
  const { data: { page, documents } } = useSuspenseQuery(documentosQueryOptions());

  return (
    <>
      <Banner image={page.cover?.url ?? undefined} alt="Capa da página de Documentos" />
      <Breadcrumb label="Documentos" slug="/documentos" routes={["/", "/dados"]} />
      <ExplanationBoxes
        boxes={[
          {
            title: "O que acontece por aqui?",
            description: page.description ?? null,
          },
          {
            title: "E o que mais?",
            description: page.objectives ?? null,
          },
        ]}
      />
      <DocumentsSession documents={documents} />
    </>
  );
}
