import { json, LoaderFunction } from "@remix-run/node";
import { DOCUMENTS_DATA, DOCUMENTS_PAGE } from "~/servers";

export const loader: LoaderFunction = async () => {
    const resDataPage1 = await fetch(DOCUMENTS_DATA, {
        cache: "no-cache",
    });

    const resDataPage2 = await fetch(DOCUMENTS_PAGE, {
        cache: "no-cache",
    });

    if (!resDataPage1.ok) {
        throw new Response("Erro ao buscar os dados", { status: resDataPage1.status });
    }

    if (!resDataPage2.ok) {
        throw new Response("Erro ao buscar os dados", { status: resDataPage2.status });
    }

    const data1 = await resDataPage1.json();
    const data2 = await resDataPage2.json();

    type document = {
        title: string;
        description: string;
        url: string;
        type: string;
        release_date: string;
        cover: any;
    };

    const documents: document[] = data1?.map((doc: any) => {
        return {
            ...doc,
            cover: doc.cover.url,
        };
    });
    
    return json({
        cover: data2.cover,
        description: data2.description,
        objectives: data2.objectives,
        documents: documents,
    });
};
