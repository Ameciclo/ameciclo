import { json, LoaderFunction } from "@remix-run/node";
import { fetchWithServerAlert } from "~/services/apiWithAlert.server";

export const loader: LoaderFunction = async () => {
    try {
        const { data, apiDown } = await fetchWithServerAlert(
            "https://cms.ameciclo.org/plataforma-de-dados",
            { cache: "no-cache" },
            10000,
            { cover: null, description: null, partners: [] } // fallback data
        );

        const { cover, description, partners } = data || {};
        return json({ 
            cover, 
            description, 
            partners,
            apiDown // passa o status da API para o componente
        });
    } catch (error) {
        console.error("Erro no loader:", error);
        return json({ 
            cover: null, 
            description: null, 
            partners: [],
            apiDown: true
        });
    }
};