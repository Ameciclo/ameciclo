import { json, LoaderFunction } from "@remix-run/node";
import { DOCUMENTS_DATA, DOCUMENTS_PAGE } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
    const errors: Array<{url: string, error: string}> = [];
    
    const onError = (url: string) => (error: string) => {
        errors.push({ url, error });
    };

    try {
        const [documentsResponse, pageResponse] = await Promise.all([
            fetchWithTimeout(
                DOCUMENTS_DATA,
                { cache: "no-cache" },
                5000,
                null,
                onError(DOCUMENTS_DATA)
            ),
            fetchWithTimeout(
                DOCUMENTS_PAGE,
                { cache: "no-cache" },
                5000,
                null,
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

        const documentsData = documentsResponse?.data || [];
        const pageData = pageResponse?.data || { cover: null, description: null, objectives: null };

        const documents: document[] = documentsData.map((doc: any) => {
            return {
                ...doc,
                cover: doc.cover?.url || null,
                coverAlt: doc.cover?.alternativeText || doc.cover?.alt || null,
            };
        });
        
        return json({
            cover: pageData.cover || null,
            description: pageData.description || null,
            objectives: pageData.objectives || null,
            documents: documents,
            apiDown: errors.length > 0,
            apiErrors: errors
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return json({
            cover: null,
            description: null,
            objectives: null,
            documents: [],
            apiDown: true,
            apiErrors: [{ url: 'DOCUMENTS_API', error: errorMessage || 'Erro desconhecido' }]
        });
    }
};
