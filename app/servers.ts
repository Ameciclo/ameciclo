// Set to false to point all services to production Atlas hosts.
const IS_DEV = true
const api = (port: number, prod: string) =>
  IS_DEV ? `http://localhost:${port}` : prod

export const CMS_BASE_URL = "https://do.strapi.ameciclo.org"

// Strapi single-types — legacy endpoints kept as documentation reference.
// Page metadata now comes from the `plataformas-de-dados` collection (PLATAFORMA_DADOS_PAGE_DATA below).
export const PROJECTS_LIST_DATA = `${CMS_BASE_URL}/api/projects?pagination[pageSize]=100&populate=media`

// Strapi `plataformas-de-dados` collection — pages lookup by slug
export const PLATAFORMA_DADOS_PAGE_DATA = (slug: string) =>
  `${CMS_BASE_URL}/api/plataformas-de-dados?filters[slug][$eq]=${slug}&populate[0]=supportfiles&populate[1]=supportfiles.file&populate[2]=supportfiles.cover&populate[3]=cover&populate[4]=explanationbox&populate[5]=methodology&populate[6]=results`

// LOA Atlas (RMR; PE variant was a stub that was never used).
export const LOA_RMR_ATLAS_API = `https://loa-rmr.atlas.ameciclo.org/`

// Budget APIs (local)
export const STATE_BUDGET_API = `${api(3017, "https://state-budget.atlas.ameciclo.org")}/v1/budget/state`
export const RECIFE_BUDGET_API = `${api(3018, "https://recife-budget.atlas.ameciclo.org")}/v1/budget/recife`

// Ideciclo Atlas
export const IDECICLO_DATA = `https://api.ideciclo.ameciclo.org/reviews`
export const IDECICLO_STRUCTURES_DATA = `https://api.ideciclo.ameciclo.org/structures`
export const IDECICLO_FORMS_DATA = `https://api.ideciclo.ameciclo.org/forms`

// Cyclist-profile Atlas (Perfil page)
export const PERFIL_API_URL = `https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/nearby?lat=-8.05&lon=-34.9&radius=100000&limit=1000`
export const PERFIL_SURVEY_LOCATIONS = `https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/survey-locations`

// Cyclist-counts Atlas (Contagens)
export const COUNTINGS_LOCAL_BASE = "http://localhost:3002"
export const COUNTINGS_ATLAS_LOCATIONS = `${COUNTINGS_LOCAL_BASE}/v1/locations`
export const COUNTINGS_ATLAS_LOCATION = (id: string) => `${COUNTINGS_LOCAL_BASE}/v1/locations/${id}`
export const COUNTINGS_ATLAS_EVENT = (id: string) => `${COUNTINGS_LOCAL_BASE}/v1/events/${id}`
export const COUNTINGS_ATLAS_EVENT_SESSIONS = (id: string) => `${COUNTINGS_LOCAL_BASE}/v1/events/${id}/sessions`
export const COUNTINGS_ATLAS_EVENT_DETAILS = (id: string) => `${COUNTINGS_LOCAL_BASE}/v1/events/${id}/details`

// DATASUS — Sinistros Fatais
export const DATASUS_SUMMARY_DATA = `http://localhost:3003/v1/summary`
export const DATASUS_CITIES_BY_YEAR_DATA = `http://localhost:3003/v1/cities-by-year`
export const DATASUS_FILTROS_DATA = `http://localhost:3003/v1/filtros`
export const DATASUS_MATRIX_DATA = `http://localhost:3003/v1/matrix`
export const DATASUS_CAUSAS_SECUNDARIAS_DATA = `http://localhost:3003/v1/causas-secundarias`

// SAMU Atlas (Emergency Calls API)
export const SAMU_ATLAS_BASE = `http://localhost:3010`
export const SAMU_CALLS_API = `${SAMU_ATLAS_BASE}/v1/calls`
export const SAMU_CALLS_OUTCOMES = `${SAMU_ATLAS_BASE}/v1/calls/outcomes`
export const SAMU_CALLS_PROFILES = `${SAMU_ATLAS_BASE}/v1/calls/profiles`
export const SAMU_SUMMARY_API = `${SAMU_ATLAS_BASE}/v1/summary`
export const SAMU_CITIES_LIST = `${SAMU_ATLAS_BASE}/v1/cities`

// Vias Inseguras — endpoints v2 of the SAMU Atlas, hardcoded to RECIFE.
export const VIAS_INSEGURAS_SUMMARY = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/summary`
export const VIAS_INSEGURAS_TOP = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/concentration?interval=150`
export const VIAS_INSEGURAS_MAP = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/RECIFE/geojson?ranking_from=1&ranking_to=150`
export const VIAS_INSEGURAS_HISTORY = `${SAMU_ATLAS_BASE}/v1/streets/history`
export const VIAS_INSEGURAS_SEARCH = `${SAMU_ATLAS_BASE}/v1/streets/search`
export const VIAS_INSEGURAS_LIST = `${SAMU_ATLAS_BASE}/v1/streets/top`
export const VIAS_INSEGURAS_HISTORY_V2 = `${SAMU_ATLAS_BASE}/v2/streets/history`
export const VIAS_INSEGURAS_STREET_SUMMARY = `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets`

// Traffic Violations — Observatório de Infrações de Trânsito
export const TRAFFIC_VIOLATIONS_BASE = api(3013, "https://traffic-violations.atlas.ameciclo.org")
export const TRAFFIC_VIOLATIONS_OVERVIEW = `${TRAFFIC_VIOLATIONS_BASE}/v1/overview`
export const TRAFFIC_VIOLATIONS_CODES = `${TRAFFIC_VIOLATIONS_BASE}/v1/violation-codes`
export const TRAFFIC_VIOLATIONS_GEOJSON = `${TRAFFIC_VIOLATIONS_BASE}/v1/streets/geojson`
export const TRAFFIC_VIOLATIONS_LAW_STATS = `${TRAFFIC_VIOLATIONS_BASE}/v1/law-stats`
export const TRAFFIC_VIOLATIONS_STREET_STATS = `${TRAFFIC_VIOLATIONS_BASE}/v1/street-stats`

// OpenRouteService — external routing API
export const OPENROUTESERVICE_CYCLING_URL = `https://api.openrouteservice.org/v2/directions/cycling-regular`

// CicloDados — atlas APIs consumed by the integrated dashboard hooks.
export const CICLODADOS_BASE = `https://ciclodados.atlas.ameciclo.org/v1`
export const BICICLETARIOS_DATA = `http://localhost:3005/v1/bicycle-racks/geojson`
export const BIKE_PE_STATIONS_DATA = `http://localhost:3015/v1/stations`
export const INFRA_CICLOVIARIA_DATA = `http://localhost:3020/v1/infrastructure/cycleways?city=2611606`
export const EXECUCAO_CICLOVIARIA_DATA = `http://localhost:3020/v1/ways/all-ways?only_all=true&precision=4&simplify=0.0001&minimal=true`
export const EXECUCAO_CICLOVIARIA_SUMMARY = `http://localhost:3020/v1/ways/summary`
export const EXECUCAO_CICLOVIARIA_RELATIONS = `http://localhost:3020/relations/by-city`
export const POINT_CICLO_NEARBY = (lat: number, lng: number, radius = 200) => `${CICLODADOS_BASE}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`

// Static data files hosted on ameciclo.org
export const AMECICLO_SITE_URL = `https://ameciclo.org`
export const AMECICLO_DBS_URL = `${AMECICLO_SITE_URL}/dbs`
export const PCR_CONTAGENS_URL = `${AMECICLO_DBS_URL}/PCR_CONTAGENS.json`
export const MALHA_CICLOVIARIA_URL = `${AMECICLO_DBS_URL}/malhacicloviariapermanente_mar2021.json`

// PDC reference URLs surfaced on the Execução Cicloviária page.
export const PDC_VOL1_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaldIY2tZS1pYRUU/view?usp=share_link&resourcekey=0-qVT9rlnlNOAdE-cs1-fn9A`
export const PDC_VOL2_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaVlpckJQVS1CTlU/view?usp=share_link&resourcekey=0-PjUIH1c2ObtbdTUGuLn28g`
export const PDC_PASTA_URL = `https://pdc.ameciclo.org`
export const CICLOMAPA_URL = `https://ciclomapa.org.br/`
export const PDC_PODCAST_URL = `https://www.youtube.com/watch?v=LEQlGK-FWnI`
export const PDC_WIKI_URL = `https://wiki.openstreetmap.org/w/index.php?title=Plano_Diretor_Ciclovi%C3%A1rio_da_Regi%C3%A3o_Metropolitana_do_Recife`

// Emergency Calls Atlas (documentation link on SAMU page)
export const EMERGENCY_CALLS_ATLAS_URL = `https://emergency-calls.atlas.ameciclo.org`
