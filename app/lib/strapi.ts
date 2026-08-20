import { strapi } from "@strapi/client";
import { CMS_BASE_URL } from "~/servers";

const STRAPI_BASE_URL = `${CMS_BASE_URL}/api`;

export const strapiClient = strapi({ baseURL: STRAPI_BASE_URL });
