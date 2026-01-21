import { defer, LoaderFunction } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { IDECICLO_STRUCTURES_DATA, IDECICLO_PAGE_DATA, IDECICLO_FORMS_DATA } from "~/servers";

export const loader: LoaderFunction = async ({ params }) => {
    const { id } = params;
    
    const structurePromise = fetchWithTimeout(
        `${IDECICLO_STRUCTURES_DATA}/${id}`,
        { cache: "no-cache" },
        5000,
        null
    );

    const pageDataPromise = fetchWithTimeout(
        IDECICLO_PAGE_DATA,
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
            `${IDECICLO_FORMS_DATA}/${newReviewFormId}`,
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