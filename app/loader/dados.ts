import { json, LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
    let apiDown = false;
    
    const data = await fetchWithTimeout(
        "https://cms.ameciclo.org/plataforma-de-dados",
        { cache: "no-cache" },
        5000,
        { cover: null, description: null, partners: [] },
        () => { apiDown = true; }
    );

    const { cover, description, partners } = data || {};
    return json({ cover, description, partners, apiDown });
};