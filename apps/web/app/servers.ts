export const CMS_BASE_URL = "https://strapi.ameciclo.org"

// Strapi single-types still consumed by unmigrated dados routes.
export const COUNTINGS_PAGE_DATA = `${CMS_BASE_URL}/api/contagem?populate=*`
export const IDECICLO_PAGE_DATA = `${CMS_BASE_URL}/api/ideciclo?populate=*`
export const LOA_PAGE_DATA = `${CMS_BASE_URL}/api/loa?populate=*`
export const DOM_PAGE_DATA = `${CMS_BASE_URL}/api/dom?populate=*`
export const PROJECTS_LIST_DATA = `${CMS_BASE_URL}/api/projects?pagination[pageSize]=100&populate=media`


// LOA Atlas (RMR; PE variant was a stub that was never used).
export const LOA_RMR_ATLAS_API = `https://loa-rmr.atlas.ameciclo.org/`

// Ideciclo Atlas
export const IDECICLO_DATA = `https://api.ideciclo.ameciclo.org/reviews`
export const IDECICLO_STRUCTURES_DATA = `https://api.ideciclo.ameciclo.org/structures`
export const IDECICLO_FORMS_DATA = `https://api.ideciclo.ameciclo.org/forms`


// Cyclist-counts Atlas (Contagens)
export const COUNTINGS_ATLAS_LOCATIONS = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`
export const COUNTINGS_ATLAS_LOCATION = (id: string) => `https://cyclist-counts.atlas.ameciclo.org/v1/locations/${id}`


// CicloDados — atlas APIs consumed by the integrated dashboard hooks.

// PDC reference URLs surfaced on the Execução Cicloviária page.
export const PDC_VOL1_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaldIY2tZS1pYRUU/view?usp=share_link&resourcekey=0-qVT9rlnlNOAdE-cs1-fn9A`
export const PDC_VOL2_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaVlpckJQVS1CTlU/view?usp=share_link&resourcekey=0-PjUIH1c2ObtbdTUGuLn28g`
export const PDC_PASTA_URL = `https://pdc.ameciclo.org`
export const CICLOMAPA_URL = `https://ciclomapa.org.br/`
export const PDC_PODCAST_URL = `https://www.youtube.com/watch?v=LEQlGK-FWnI`
export const PDC_WIKI_URL = `https://wiki.openstreetmap.org/w/index.php?title=Plano_Diretor_Ciclovi%C3%A1rio_da_Regi%C3%A3o_Metropolitana_do_Recife`
