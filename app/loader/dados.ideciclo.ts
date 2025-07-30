import { defer, LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async () => {
    const idecicloPromise = fetchWithTimeout(
        "https://api.ideciclo.ameciclo.org/reviews", 
        { cache: "no-cache" },
        5000,
        []
    );

    const structuresPromise = fetchWithTimeout(
        "https://api.ideciclo.ameciclo.org/structures",
        { cache: "no-cache" },
        5000,
        []
    );

    const pageDataPromise = fetchWithTimeout(
        "https://cms.ameciclo.org/ideciclo", 
        { cache: "no-cache" },
        5000,
        { description: "", objective: "", methodology: "" }
    );

    return defer({
        ideciclo: idecicloPromise,
        structures: structuresPromise,
        pageData: pageDataPromise,
    });
};
