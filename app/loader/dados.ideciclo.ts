import { LoaderFunction, json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { IDECICLO_DATA, IDECICLO_STRUCTURES_DATA, IDECICLO_PAGE_DATA } from "~/servers";

export const loader: LoaderFunction = async () => {
    const errors: Array<{url: string, error: string}> = [];
    
    const onError = (url: string) => (error: string) => {
        errors.push({ url, error });
    };

    const [idecicloData, structuresData, pageDataResponse] = await Promise.all([
        fetchWithTimeout(
            IDECICLO_DATA, 
            { cache: "no-cache" },
            30000,
            [],
            onError(IDECICLO_DATA)
        ),
        fetchWithTimeout(
            IDECICLO_STRUCTURES_DATA,
            { cache: "no-cache" },
            30000,
            [],
            onError(IDECICLO_STRUCTURES_DATA)
        ),
        fetchWithTimeout(
            IDECICLO_PAGE_DATA, 
            { cache: "no-cache" },
            30000,
            null,
            onError(IDECICLO_PAGE_DATA)
        )
    ]);

    const pageData = pageDataResponse?.data || { description: "", objective: "", methodology: "", cover: null };

    return json({
        ideciclo: idecicloData,
        structures: structuresData,
        pageData,
        apiDown: errors.length > 0,
        apiErrors: errors
    });
};
