import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { PLATAFORM_HOME_PAGE } from "~/servers";

export const loader = async () => {
    const errors: Array<{url: string, error: string}> = [];

    const onError = (url: string) => (error: string) => {
        errors.push({ url, error });
    };

    const response = await fetchWithTimeout(
        PLATAFORM_HOME_PAGE,
        {},
        5000,
        null,
        onError(PLATAFORM_HOME_PAGE)
    );

    const data = response?.data || {};
    const { cover, description, partners } = data;

    return {
        data: {
            cover: cover || null,
            description: description || '',
            partners: partners || [],
            apiDown: errors.length > 0
        },
        apiDown: errors.length > 0,
        apiErrors: errors
    };
};