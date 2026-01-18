export const CMS_BASE_URL = "https://do.strapi.ameciclo.org"
export const HOME_DATA = `${CMS_BASE_URL}/api/home`
export const AMECICLISTAS_DATA = `${CMS_BASE_URL}/api/ameciclistas?populate=media&pagination[pageSize]=100`
export const QUEM_SOMOS_DATA = `${CMS_BASE_URL}/api/quem-somo?populate=links`
export const PLATAFORM_HOME_PAGE = `${CMS_BASE_URL}/api/plataforma-de-dado?populate[partners][populate]=image&populate=cover`
export const DOCUMENTS_PAGE = `${CMS_BASE_URL}/api/documento?populate=*`
export const DOCUMENTS_DATA = `${CMS_BASE_URL}/api/documents?populate=*&pagination[pageSize]=100`
export const COUNTINGS_PAGE_DATA = `${CMS_BASE_URL}/api/contagem?populate=*`
export const IDECICLO_PAGE_DATA = `${CMS_BASE_URL}/api/ideciclo?populate=*`
export const PERFIL_PAGE_DATA = `${CMS_BASE_URL}/api/perfil?populate=*`
export const PROJECTS_DATA = `${CMS_BASE_URL}/api/projects`
export const PROJECTS_LIST_DATA = `${PROJECTS_DATA}?pagination[pageSize]=100&populate=media`
export const PROJECT_DETAIL_DATA = (slug: string) => `${PROJECTS_DATA}?filters[slug][$eq]=${slug}&populate=*`
export const WORKGROUPS_DATA = `${CMS_BASE_URL}/api/workgroups`
export const WORKGROUPS_LIST_DATA = `${WORKGROUPS_DATA}?pagination[pageSize]=100`
export const PLATAFORMAS_PAGE_DATA = `${CMS_BASE_URL}/api/plataformas-de-dados?populate=*`
export const LOA_PAGE_DATA = `${CMS_BASE_URL}/api/loa?populate=*`
export const DOM_PAGE_DATA = `${CMS_BASE_URL}/api/dom?populate=*`

// APIs Atlas para LOA e DOM - Dados Abertos PE
// TODO: Substituir URLs quando APIs estiverem disponíveis
export const LOA_PE_ATLAS_API = `https://loa-pe.atlas.ameciclo.org/`
export const LOA_RMR_ATLAS_API = `https://loa-rmr.atlas.ameciclo.org/`

export const IDECICLO_DATA = `https://api.ideciclo.ameciclo.org/reviews`
export const IDECICLO_STRUCTURES_DATA = `https://api.ideciclo.ameciclo.org/structures`
export const IDECICLO_FORMS_DATA = `https://api.ideciclo.ameciclo.org/forms`
export const PERFIL_DATA = `https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/nearby?lat=-8.05&lon=-34.9&radius=100000&limit=1000`
export const PERFIL_API_URL = `https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/nearby?lat=-8.05&lon=-34.9&radius=100000&limit=1000`

export const COUNTINGS_ATLAS_LOCATIONS = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`
export const COUNTINGS_ATLAS_LOCATION = (id: string) => `https://cyclist-counts.atlas.ameciclo.org/v1/locations/${id}`

export const OBSERVATORY_DATA =`https://api.garfo.ameciclo.org/cyclist-infra/relationsByCity`
export const OBSERVATORY_DATA_WAYS =`https://api.garfo.ameciclo.org/cyclist-infra/ways`
export const OBSERVATORY_DATA_ALL_WAYS = `https://api.garfo.ameciclo.org/cyclist-infra/ways/all-ways`
export const OBSERVATORY_DATA_WAYS_SUMMARY =`https://api.garfo.ameciclo.org/cyclist-infra/ways/summary`
export const CITIES_DATA =`https://api.garfo.ameciclo.org/cities`

export const SINISTROS_SUMMARY_DATA =`https://api.garfo.ameciclo.org/traffic-crashes/summary`
export const SINISTROS_GEOJSON_DATA =`https://api.garfo.ameciclo.org/traffic-crashes/geojson`
export const SINISTROS_VEHICLES_DATA =`https://api.garfo.ameciclo.org/traffic-crashes/vehicles`
export const SINISTROS_STREETS_SUMMARY_DATA =`https://api.garfo.ameciclo.org/traffic-crashes/streets-summary`

// Endpoints para o Observatório de Sinistros Fatais (DATASUS)
export const DATASUS_SUMMARY_DATA =`https://api.garfo.ameciclo.org/datasus-deaths/summary`
export const DATASUS_CITIES_BY_YEAR_DATA =`https://api.garfo.ameciclo.org/datasus-deaths/cities-by-year`
export const DATASUS_FILTROS_DATA =`https://api.garfo.ameciclo.org/datasus-deaths/filtros`
export const DATASUS_MATRIX_DATA =`https://api.garfo.ameciclo.org/datasus-deaths/matrix`
export const DATASUS_CAUSAS_SECUNDARIAS_DATA =`https://api.garfo.ameciclo.org/datasus-deaths/causas-secundarias`

// Endpoint do Strapi específico para o Observatório de Sinistros Fatais
export const OBSERVATORIO_SINISTROS_PAGE_DATA = `${CMS_BASE_URL}/api/plataformas-de-dados?filters[title][$eq]=Observatório de Sinistros Fatais&populate[0]=supportfiles&populate[1]=supportfiles.file&populate[2]=supportfiles.cover&populate[3]=cover&populate[4]=explanationbox`

// Endpoints para Vias Inseguras
export const VIAS_INSEGURAS_BASE_URL = "https://api.garfo.ameciclo.org"

// Endpoints para o Observatório de Chamadas do SAMU (Emergency Calls API)
export const SAMU_ATLAS_BASE = `https://emergency-calls.atlas.ameciclo.org`

// Emergency Calls - Core endpoints
export const SAMU_CALLS_API = `${SAMU_ATLAS_BASE}/v1/calls`
export const SAMU_CALL_BY_ID = (id: string | number) => `${SAMU_ATLAS_BASE}/v1/calls/${id}`
export const SAMU_CALLS_SUMMARY = `${SAMU_ATLAS_BASE}/v1/calls/summary`
export const SAMU_CALLS_CITIES = `${SAMU_ATLAS_BASE}/v1/calls/cities`
export const SAMU_CALLS_CITY_STATS = (city: string) => `${SAMU_ATLAS_BASE}/v1/calls/cities/${city}/stats`
export const SAMU_CALLS_OUTCOMES = `${SAMU_ATLAS_BASE}/v1/calls/outcomes`
export const SAMU_CALLS_PROFILES = `${SAMU_ATLAS_BASE}/v1/calls/profiles`

// Emergency Calls - Summary & Filters
export const SAMU_SUMMARY_API = `${SAMU_ATLAS_BASE}/v1/summary`
export const SAMU_FILTERS_API = `${SAMU_ATLAS_BASE}/v1/filters`

// Emergency Calls - Streets Analysis (v1)
export const SAMU_STREETS_SUMMARY = `${SAMU_ATLAS_BASE}/v1/streets/summary`
export const SAMU_STREETS_TOP = `${SAMU_ATLAS_BASE}/v1/streets/top`
export const SAMU_STREETS_SEARCH = `${SAMU_ATLAS_BASE}/v1/streets/search`
export const SAMU_STREETS_HISTORY = `${SAMU_ATLAS_BASE}/v1/streets/history`

// Emergency Calls - Cities
export const SAMU_CITIES_API = `${SAMU_ATLAS_BASE}/v1/cities`
export const SAMU_CITIES_LIST = `${SAMU_ATLAS_BASE}/v1/cities`

// Emergency Calls - Analytics
export const SAMU_ANALYTICS_MUNICIPALITIES = `${SAMU_ATLAS_BASE}/v1/analytics/municipalities`
export const SAMU_ANALYTICS_ACCIDENT_TYPES = `${SAMU_ATLAS_BASE}/v1/analytics/accident-types`
export const SAMU_ANALYTICS_GENDER = `${SAMU_ATLAS_BASE}/v1/analytics/gender-distribution`
export const SAMU_ANALYTICS_DANGEROUS_STREETS = `${SAMU_ATLAS_BASE}/v1/analytics/dangerous-streets`

// Emergency Calls - Unsafe Streets (v2)
export const SAMU_UNSAFE_STREETS_CITY_SUMMARY = (city: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/${city}/summary`
export const SAMU_UNSAFE_STREETS_CITY_CONCENTRATION = (city: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/${city}/concentration`
export const SAMU_UNSAFE_STREETS_CITY_GEOJSON = (city: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/cities/${city}/geojson`
export const SAMU_UNSAFE_STREETS_STREET_SUMMARY = (streetName: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets/${encodeURIComponent(streetName)}/summary`
export const SAMU_UNSAFE_STREETS_STREET_PROFILES = (streetName: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets/${encodeURIComponent(streetName)}/profiles`
export const SAMU_UNSAFE_STREETS_STREET_GEOJSON = (streetName: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets/${encodeURIComponent(streetName)}/geojson`
export const SAMU_UNSAFE_STREETS_STREET_EVOLUTION = (streetName: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets/${encodeURIComponent(streetName)}/evolution`
export const SAMU_UNSAFE_STREETS_STREET_RECORDS = (streetName: string) => `${SAMU_ATLAS_BASE}/v2/unsafe-streets/streets/${encodeURIComponent(streetName)}/records`

// System Health
export const SAMU_HEALTH = `${SAMU_ATLAS_BASE}/health`

// TODO: Integração Strapi - Descomentar quando API estiver disponível
// export const SAMU_PAGE_DATA = `${CMS_BASE_URL}/api/samu?populate=*`

// Vias Inseguras - Usando novos endpoints v2 do SAMU Atlas
export const VIAS_INSEGURAS_SUMMARY = SAMU_UNSAFE_STREETS_CITY_SUMMARY('RECIFE')
export const VIAS_INSEGURAS_TOP = `${SAMU_UNSAFE_STREETS_CITY_CONCENTRATION('RECIFE')}?interval=150`
export const VIAS_INSEGURAS_MAP = `${SAMU_UNSAFE_STREETS_CITY_GEOJSON('RECIFE')}?ranking_from=1&ranking_to=150`
export const VIAS_INSEGURAS_HISTORY = `${SAMU_ATLAS_BASE}/v1/streets/history`
export const VIAS_INSEGURAS_SEARCH = `${SAMU_ATLAS_BASE}/v1/streets/search`
export const VIAS_INSEGURAS_LIST = `${SAMU_ATLAS_BASE}/v1/streets/top`

// Endpoints para CicloDados - APIs da página de dados integrados
export const BICICLETARIOS_DATA = `https://bicycle-racks.atlas.ameciclo.org/v1/bicycle-racks/geojson`
export const BIKE_PE_STATIONS_DATA = `https://shared-bike.atlas.ameciclo.org/v1/stations`
export const INFRA_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/infrastructure-geojson?city=2611606&limit=10000`
export const PONTOS_CONTAGEM_DATA = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`
export const PONTOS_CONTAGEM_NEARBY_DATA = `https://cyclist-counts.atlas.ameciclo.org/v1/locations/nearby`
export const EXECUCAO_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/ways/all-ways?only_all=true&precision=4&simplify=0.0001&minimal=true`
export const EXECUCAO_CICLOVIARIA_SUMMARY = `https://cycling-infra.atlas.ameciclo.org/v1/ways/summary`
export const EXECUCAO_CICLOVIARIA_RELATIONS = `https://cycling-infra.atlas.ameciclo.org/relations/by-city`
export const PDC_VOL1_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaldIY2tZS1pYRUU/view?usp=share_link&resourcekey=0-qVT9rlnlNOAdE-cs1-fn9A`
export const PDC_VOL2_URL = `https://drive.google.com/file/d/0BxR5Ri6g5X_ZaVlpckJQVS1CTlU/view?usp=share_link&resourcekey=0-PjUIH1c2ObtbdTUGuLn28g`
export const PDC_PASTA_URL = `https://pdc.ameciclo.org`
export const CICLOMAPA_URL = `https://ciclomapa.org.br/`
export const PDC_PODCAST_URL = `https://www.youtube.com/watch?v=LEQlGK-FWnI`
export const PDC_WIKI_URL = `https://wiki.openstreetmap.org/w/index.php?title=Plano_Diretor_Ciclovi%C3%A1rio_da_Regi%C3%A3o_Metropolitana_do_Recife`
export const SINISTROS_GEOJSON_CICLO_DATA = `https://traffic-violations.atlas.ameciclo.org/v1/dangerous-streets/geojson`
export const PERFIL_CICLO_DATA = `https://ciclodados.atlas.ameciclo.org/v1/cyclist-profile`
export const POINT_CICLO_NEARBY = (lat, lng, radius = 200) => `https://ciclodados.atlas.ameciclo.org/v1/nearby?lat=${lat}&lng=${lng}&radius=${radius}`

// Objeto SERVERS para compatibilidade
export const SERVERS = {
  BICICLETARIOS: BICICLETARIOS_DATA,
  BIKE_PE_STATIONS: BIKE_PE_STATIONS_DATA,
  INFRA_CICLOVIARIA: INFRA_CICLOVIARIA_DATA,
  PONTOS_CONTAGEM: PONTOS_CONTAGEM_DATA,
  PONTOS_CONTAGEM_NEARBY: PONTOS_CONTAGEM_NEARBY_DATA,
  EXECUCAO_CICLOVIARIA: EXECUCAO_CICLOVIARIA_DATA,
  SINISTROS_GEOJSON_CICLO: SINISTROS_GEOJSON_CICLO_DATA,
  PERFIL_CICLO: PERFIL_CICLO_DATA
}
