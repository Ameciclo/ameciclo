import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const res = await fetch("https://cms.ameciclo.org/documents", {
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Response("Erro ao buscar os dados", { status: res.status });
    }

    const data = await res.json();

    type document = {
        title: string;
        description: string;
        url: string;
        type: string;
        release_date: string;
        cover: any;
    };

    const documents: document[] = data?.map((doc: any) => {
        return {
            ...doc,
            cover: doc.cover.url,
        };
    });
    
    return json({
        cover: data.cover,
        description: data.description,
        objectives: data.objectives,
        documents: documents,
    });
};
