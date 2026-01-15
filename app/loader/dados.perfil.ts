import { json, LoaderFunction } from "@remix-run/node";
import { PERFIL_PAGE_DATA } from "~/servers";

const PERFIL_API_URL = "https://api.perfil.ameciclo.org/v1/cyclist-profile/summary/";

export const loader: LoaderFunction = async () => {
    let apiDown = false;
    const apiErrors: Array<{url: string, error: string}> = [];
    let cover = null;
    let description = "";
    let objective = "";

    // Tenta buscar dados do Strapi
    try {
        const res = await fetch(PERFIL_PAGE_DATA, {
            cache: "no-cache",
            signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
            const data = await res.json();
            cover = data.cover;
            description = data.description;
            objective = data.objective;
        } else {
            apiErrors.push({
                url: PERFIL_PAGE_DATA,
                error: `Strapi retornou status ${res.status}`
            });
        }
    } catch (error) {
        console.error("Erro ao buscar dados do Strapi:", error);
        apiErrors.push({
            url: PERFIL_PAGE_DATA,
            error: error instanceof Error ? error.message : "Erro ao conectar com Strapi"
        });
    }
    
    // Testa se a API de perfil está funcionando
    try {
        const apiTest = await fetch(PERFIL_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([]),
            signal: AbortSignal.timeout(5000)
        });
        
        if (!apiTest.ok) {
            apiDown = true;
            apiErrors.push({
                url: PERFIL_API_URL,
                error: `API retornou status ${apiTest.status}`
            });
        }
    } catch (apiError) {
        apiDown = true;
        apiErrors.push({
            url: PERFIL_API_URL,
            error: apiError instanceof Error ? apiError.message : "Erro desconhecido"
        });
    }
    
    return json({ 
        cover,
        description,
        objective,
        apiDown,
        apiErrors
    });
};