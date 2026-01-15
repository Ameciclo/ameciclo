import { json, LoaderFunction } from "@remix-run/node";
import { DOCUMENTS_DATA, DOCUMENTS_PAGE } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
    const errors: Array<{url: string, error: string}> = [];
    
    const onError = (url: string) => (error: string) => {
        errors.push({ url, error });
    };

    try {
        const [data1, data2] = await Promise.all([
            fetchWithTimeout(
                DOCUMENTS_DATA,
                { cache: "no-cache" },
                5000,
                [],
                onError(DOCUMENTS_DATA)
            ),
            fetchWithTimeout(
                DOCUMENTS_PAGE,
                { cache: "no-cache" },
                5000,
                { cover: null, description: null, objectives: null },
                onError(DOCUMENTS_PAGE)
            )
        ]);

        type document = {
            title: string;
            description: string;
            url: string;
            type: string;
            release_date: string;
            cover: any;
            coverAlt?: string;
        };

        const documents: document[] = data1?.map((doc: any) => {
            return {
                ...doc,
                cover: doc.cover.url,
                coverAlt: doc.cover.alternativeText || doc.cover.alt,
            };
        }) || [];
        
        return json({
            cover: data2?.cover || null,
            description: data2?.description || null,
            objectives: data2?.objectives || null,
            documents: documents,
            apiDown: errors.length > 0,
            apiErrors: errors
        });
    } catch (error) {
        return json({
            cover: null,
            description: null,
            objectives: null,
            documents: [],
            apiDown: true,
            apiErrors: [{ url: 'DOCUMENTS_API', error: error.message || 'Erro desconhecido' }]
        });
    }
};
