export const CMS_BASE_URL = "https://do.strapi.ameciclo.org"

// Strapi single-types still consumed by unmigrated dados routes.
export const COUNTINGS_PAGE_DATA = `${CMS_BASE_URL}/api/contagem?populate=*`
export const IDECICLO_PAGE_DATA = `${CMS_BASE_URL}/api/ideciclo?populate=*`
export const LOA_PAGE_DATA = `${CMS_BASE_URL}/api/loa?populate=*`
export const DOM_PAGE_DATA = `${CMS_BASE_URL}/api/dom?populate=*`
export const PROJECTS_LIST_DATA = `${CMS_BASE_URL}/api/projects?pagination[pageSize]=100&populate=media`

// Strapi `plataformas-de-dados` collection filtered for the Sinistros Fatais page.
export const OBSERVATORIO_SINISTROS_PAGE_DATA = `${CMS_BASE_URL}/api/plataformas-de-dados?filters[title][$eq]=Observatório de Sinistros Fatais&populate[0]=supportfiles&populate[1]=supportfiles.file&populate[2]=supportfiles.cover&populate[3]=cover&populate[4]=explanationbox`

// LOA Atlas (RMR; PE variant was a stub that was never used).
export const LOA_RMR_ATLAS_API = `https://loa-rmr.atlas.ameciclo.org/`

// Ideciclo Atlas
export const IDECICLO_DATA = `https://api.ideciclo.ameciclo.org/reviews`
export const IDECICLO_STRUCTURES_DATA = `https://api.ideciclo.ameciclo.org/structures`
export const IDECICLO_FORMS_DATA = `https://api.ideciclo.ameciclo.org/forms`

// Cyclist-profile Atlas (Perfil page)
export const PERFIL_API_URL = `https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/nearby?lat=-8.05&lon=-34.9&radius=100000&limit=1000`

// Cyclist-counts Atlas (Contagens)
export const COUNTINGS_ATLAS_LOCATIONS = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`
export const COUNTINGS_ATLAS_LOCATION = (id: string) => `https://cyclist-counts.atlas.ameciclo.org/v1/locations/${id}`

// DATASUS — Sinistros Fatais
export const DATASUS_SUMMARY_DATA = `https://api.garfo.ameciclo.org/datasus-deaths/summary`
export const DATASUS_CITIES_BY_YEAR_DATA = `https://api.garfo.ameciclo.org/datasus-deaths/cities-by-year`
export const DATASUS_FILTROS_DATA = `https://api.garfo.ameciclo.org/datasus-deaths/filtros`
export const DATASUS_MATRIX_DATA = `https://api.garfo.ameciclo.org/datasus-deaths/matrix`
export const DATASUS_CAUSAS_SECUNDARIAS_DATA = `https://api.garfo.ameciclo.org/datasus-deaths/causas-secundarias`

// SAMU Atlas (Emergency Calls API)
export const SAMU_ATLAS_BASE = `https://emergency-calls.atlas.ameciclo.org`
export const SAMU_CALLS_API = `${SAMU_ATLAS_BASE}/v1/calls`
export const SAMU_CALLS_OUTCOMES = `${SAMU_ATLAS_BASE}/v1/calls/outcomes`
export const SAMU_CALLS_PROFILES = `${SAMU_ATLAS_BASE}/v1/calls/profiles`
export const SAMU_SUMMARY_API = `${SAMU_ATLAS_BASE}/v1/summary`
export const SAMU_CITIES_LIST = `${SAMU_ATLAS_BASE}/v1/cities`

// Vias Inseguras — endpoints v2 of the SAMU Atlas, hardcoded to RECIFE.
export const VIAS_INSEGURAS_BASE_URL = "https://api.garfo.ameciclo.org"
export const VIAS_INSEGURAS_SUMMARY = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/summary`
export const VIAS_INSEGURAS_TOP = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/concentration?interval=150`
export const VIAS_INSEGURAS_MAP = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/geojson?ranking_from=1&ranking_to=150`
export const VIAS_INSEGURAS_HISTORY = `${SAMU_ATLAS_BASE}/v1/streets/history`
export const VIAS_INSEGURAS_SEARCH = `${SAMU_ATLAS_BASE}/v1/streets/search`
export const VIAS_INSEGURAS_LIST = `${SAMU_ATLAS_BASE}/v1/streets/top`

// CicloDados — atlas APIs consumed by the integrated dashboard hooks.
export const BICICLETARIOS_DATA = `https://bicycle-racks.atlas.ameciclo.org/v1/bicycle-racks/geojson`
export const BIKE_PE_STATIONS_DATA = `https://shared-bike.atlas.ameciclo.org/v1/stations`
export const INFRA_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/infrastructure-geojson?city=2611606&limit=10000`
export const EXECUCAO_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/ways/all-ways?only_all=true&precision=4&simplify=0.0001&minimal=true`
export const EXECUCAO_CICLOVIARIA_SUMMARY = `https://cycling-infra.atlas.ameciclo.org/v1/ways/summary`
export const EXECUCAO_CICLOVIARIA_RELATIONS = `https://cycling-infra.atlas.ameciclo.org/relations/by-city`
export const POINT_CICLO_NEARBY = (lat: number, lng: number, radius = 200) => `https://ciclodados.atlas.ameciclo.org/v1/nearby?lat=${lat}&lng=${lng}&radius=${radius}`

// PDC reference URLs surfaced on the Execução Cicloviária page.
export const PDC_VOL1_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaldIY2tZS1pYRUU/view?usp=share_link&resourcekey=0-qVT9rlnlNOAdE-cs1-fn9A`
export const PDC_VOL2_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaVlpckJQVS1CTlU/view?usp=share_link&resourcekey=0-PjUIH1c2ObtbdTUGuLn28g`
export const PDC_PASTA_URL = `https://pdc.ameciclo.org`
export const CICLOMAPA_URL = `https://ciclomapa.org.br/`
export const PDC_PODCAST_URL = `https://www.youtube.com/watch?v=LEQlGK-FWnI`
export const PDC_WIKI_URL = `https://wiki.openstreetmap.org/w/index.php?title=Plano_Diretor_Ciclovi%C3%A1rio_da_Regi%C3%A3o_Metropolitana_do_Recife`
