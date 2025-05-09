import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";

import { loader } from "~/loader/dados.observatorio.dom";
export { loader };

export default function Dom() {
    const { cover, description } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Diágnóstico Orçamentário Municipal" />
            <Breadcrumb label="dom" slug="/dados/observatorio/dom" routes={["/", "/dados", "/dados/observatorio"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />
        </>
    );
}