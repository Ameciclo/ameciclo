import { LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { IDECICLO_DATA, IDECICLO_STRUCTURES_DATA, IDECICLO_PAGE_DATA } from "~/servers";

export const loader: LoaderFunction = async () => {
    const idecicloPromise = fetchWithTimeout(
        IDECICLO_DATA, 
        { cache: "no-cache" },
        30000,
        []
    );

    const structuresPromise = fetchWithTimeout(
        IDECICLO_STRUCTURES_DATA,
        { cache: "no-cache" },
        30000,
        []
    );

    const pageDataPromise = fetchWithTimeout(
        IDECICLO_PAGE_DATA, 
        { cache: "no-cache" },
        30000,
        { description: "", objective: "", methodology: "" }
    );

    const [idecicloData, structuresData, pageDataData] = await Promise.all([
        idecicloPromise,
        structuresPromise,
        pageDataPromise
    ]);

    return {
        ideciclo: idecicloData,
        structures: structuresData,
        pageData: pageDataData,
    };
};
