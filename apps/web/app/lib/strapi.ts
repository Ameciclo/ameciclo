import { strapi } from "@strapi/client";

const STRAPI_BASE_URL = "https://strapi.ameciclo.org/api";

export const strapiClient = strapi({ baseURL: STRAPI_BASE_URL });
