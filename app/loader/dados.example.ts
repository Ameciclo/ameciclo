import { fetchWithServerAlert } from "~/services/apiWithAlert.server";
import { PLATAFORM_HOME_PAGE } from "~/servers";

export const loader = async () => {
    try {
        const { data, apiDown } = await fetchWithServerAlert(
            PLATAFORM_HOME_PAGE,
            { cache: "no-cache" },
            10000,
            { cover: null, description: null, partners: [] } // fallback data
        );

        const { cover, description, partners } = data || {};
        return {
            cover,
            description,
            partners,
            apiDown // passa o status da API para o componente
        };
    } catch (error) {
        console.error("Erro no loader:", error);
        return {
            cover: null,
            description: null,
            partners: [],
            apiDown: true
        };
    }
};