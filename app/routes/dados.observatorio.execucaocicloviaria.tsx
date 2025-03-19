import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";

export const loader: LoaderFunction = async () => {
    const res = await fetch("https://cms.ameciclo.org/execucao-cicloviaria", {
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Erro ao buscar os dados");
    }

    const data = await res.json();
    return json({ cover: data.cover });
};

export default function ExecucaoCicloviaria() {
    const { cover } = useLoaderData<typeof loader>();

    return (<Banner image={cover?.url} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />);
}