import { defer, LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
    let apiDown = false;
    
    const dataPromise = fetchWithTimeout(
        "https://cms.ameciclo.org/plataforma-de-dados",
        { cache: "no-cache" },
        5000,
        { cover: null, description: null, partners: [] },
        () => { apiDown = true; }
    ).then(data => {
        const { cover, description, partners } = data || {};
        return { cover, description, partners, apiDown };
    });

    return defer({ dataPromise });
};