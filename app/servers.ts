export const CMS_BASE_URL = "https://cms.ameciclo.org"
export const PLATAFORM_HOME_PAGE = "https://cms.ameciclo.org/plataforma-de-dados"
export const DOCUMENTS_PAGE = "https://cms.ameciclo.org/documentos"
export const DOCUMENTS_DATA = "https://cms.ameciclo.org/documents"
export const COUNTINGS_PAGE_DATA =`https://cms.ameciclo.org/contagens`
export const IDECICLO_PAGE_DATA = `https://cms.ameciclo.org/ideciclo`
export const PERFIL_PAGE_DATA = `https://cms.ameciclo.org/perfil`
export const PROJECTS_DATA = "https://cms.ameciclo.org/projects"
export const WORKGROUPS_DATA = "https://cms.ameciclo.org/workgroups"

export const IDECICLO_DATA = `https://api.ideciclo.ameciclo.org/reviews`
export const IDECICLO_STRUCTURES_DATA = `https://api.ideciclo.ameciclo.org/structures`
export const IDECICLO_FORMS_DATA = `https://api.ideciclo.ameciclo.org/forms`
export const PERFIL_DATA = `https://api.perfil.ameciclo.org/v1/cyclist-profile/summary/`

export const COUNTINGS_SUMMARY_DATA =`https://api.garfo.ameciclo.org/cyclist-counts`     
export const COUNTINGS_DATA =`https://api.garfo.ameciclo.org/cyclist-counts/edition`

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
export const OBSERVATORIO_SINISTROS_PAGE_DATA = `https://do.strapi.ameciclo.org/api/plataformas-de-dados?filters[title][$eq]=Observatório de Sinistros Fatais&populate[0]=supportfiles&populate[1]=supportfiles.file&populate[2]=supportfiles.cover&populate[3]=cover&populate[4]=explanationbox`

// Endpoint do Strapi para dados das plataformas (mantido para compatibilidade)
export const PLATAFORMAS_PAGE_DATA = `https://do.strapi.ameciclo.org/api/plataformas-de-dados?populate=*`

// Endpoints para Vias Inseguras
export const VIAS_INSEGURAS_BASE_URL = `https://api.garfo.ameciclo.org`

// Endpoints para o Observatório de Chamadas do SAMU
export const SAMU_SUMMARY_DATA = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/summary`
export const SAMU_CITIES_DATA = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/cities`

export const VIAS_INSEGURAS_SUMMARY = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/summary`
export const VIAS_INSEGURAS_TOP = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/top?limite=2111&intervalor=1`
export const VIAS_INSEGURAS_MAP = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/map?limite=2111`
export const VIAS_INSEGURAS_HISTORY = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/history`
export const VIAS_INSEGURAS_SEARCH = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/search`
export const VIAS_INSEGURAS_LIST = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/list`

// Endpoints para CicloDados - APIs da página de dados integrados
export const BICICLETARIOS_DATA = `https://bicycle-racks.atlas.ameciclo.org/v1/bicycle-racks/geojson`
export const BIKE_PE_STATIONS_DATA = `https://shared-bike.atlas.ameciclo.org/v1/stations`
export const INFRA_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/infrastructure-geojson?city=2611606&limit=10000`
export const PONTOS_CONTAGEM_DATA = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`
export const PONTOS_CONTAGEM_NEARBY_DATA = `https://cyclist-counts.atlas.ameciclo.org/v1/locations/nearby`
export const EXECUCAO_CICLOVIARIA_DATA = `https://cycling-infra.atlas.ameciclo.org/v1/ways/all-ways?only_all=true&precision=4&simplify=0.0001&minimal=true`
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
