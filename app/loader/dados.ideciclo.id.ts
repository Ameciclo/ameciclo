import { defer, LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader: LoaderFunction = async ({ params }) => {
    const { id } = params;
    
    const structurePromise = fetchWithTimeout(
        `https://api.ideciclo.ameciclo.org/structures/${id}`,
        { cache: "no-cache" },
        5000,
        null
    );

    const pageDataPromise = fetchWithTimeout(
        "https://cms.ameciclo.org/ideciclo",
        { cache: "no-cache" },
        5000,
        { cover: { url: "/pages_covers/ideciclo-cover.png" }, description: "", objective: "", methodology: "" }
    );

    const formsPromise = structurePromise.then(async (structure) => {
        if (!structure || !structure.reviews || structure.reviews.length === 0) {
            return null;
        }
        
        const newReviewFormId = structure.reviews[structure.reviews.length - 1].segments[0].form_id;
        
        return fetchWithTimeout(
            `https://api.ideciclo.ameciclo.org/forms/${newReviewFormId}`,
            { cache: "no-cache" },
            5000,
            null
        );
    });

    return defer({
        structurePromise,
        pageDataPromise,
        formsPromise,
        id
    });
};