import { strapi } from "@strapi/client";

const STRAPI_BASE_URL = "https://do.strapi.ameciclo.org/api";

export const strapiClient = strapi({ baseURL: STRAPI_BASE_URL });
