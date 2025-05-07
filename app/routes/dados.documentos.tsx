import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";

import { loader } from "~/loader/dados.documentos";
export { loader };

export default function Documentos() {
    const { cover, description } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de Documentos" />
            <Breadcrumb label="Documentos" slug="/documentos" routes={["/", "/dados"]} />
            <ExplanationBoxes boxes={[{title: "O que acontece por aqui?", description: description}]} />
        </>

    );
}