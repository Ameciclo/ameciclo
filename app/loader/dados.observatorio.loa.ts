import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const res = await fetch("https://cms.ameciclo.org/plataforma-de-dados", {
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Response("Erro ao buscar os dados", { status: res.status });
    }

    const data = await res.json();
    const { cover, description } = data;

    return json({
        cover,
        description
    });
};