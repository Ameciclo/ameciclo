import { json, LoaderFunction } from "@remix-run/node";
import { PERFIL_PAGE_DATA, PERFIL_API_URL } from "~/servers";

export const loader: LoaderFunction = async () => {
    let apiDown = false;
    const apiErrors: Array<{url: string, error: string}> = [];
    let cover = null;
    let description = "";
    let objective = "";
    let profileData = null;

    // Tenta buscar dados do Strapi
    try {
        const res = await fetch(PERFIL_PAGE_DATA, {
            cache: "no-cache",
            signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
            const response = await res.json();
            const data = response?.data || {};
            cover = data.cover || null;
            description = data.description || "";
            objective = data.objective || "";
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
    
    // Busca dados de perfil da API
    try {
        const apiTest = await fetch(PERFIL_API_URL, {
            method: "GET",
            signal: AbortSignal.timeout(10000)
        });
        
        if (apiTest.ok) {
            profileData = await apiTest.json();
        } else {
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
        profileData,
        apiDown,
        apiErrors
    });
};