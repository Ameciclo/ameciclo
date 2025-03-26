import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

export const loader: LoaderFunction = async () => {
    const res = await fetch("https://cms.ameciclo.org/plataforma-de-dados", {
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Response("Erro ao buscar os dados", { status: res.status });
    }

    const data = await res.json();
    return json({ cover: data.cover });
};


export default function Dom() {
    const { cover } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Diágnóstico Orçamentário Municipal" />
            <Breadcrumb label="dom" slug="/dados/observatorio/dom" routes={["/", "/dados", "/dados/observatorio"]} />
        </>
    );
}