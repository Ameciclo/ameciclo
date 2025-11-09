// Configuração centralizada das APIs
export const API_CONFIG = {
  // URLs base das APIs
  CMS_BASE_URL: "https://cms.ameciclo.org",
  GARFO_API_BASE_URL: "https://api.garfo.ameciclo.org",
  IDECICLO_API_BASE_URL: "https://api.ideciclo.ameciclo.org",
  STREETS_API_BASE_URL: "http://localhost:3050",
  
  // Timeouts
  DEFAULT_TIMEOUT: 10000,
  FAST_TIMEOUT: 5000,
  
  // URLs específicas
  ENDPOINTS: {
    HOME: "https://cms.ameciclo.org/home",
    PROJECTS: "https://cms.ameciclo.org/projects",
    CONTAGENS: "https://cms.ameciclo.org/contagens",
    DOCUMENTOS: "https://cms.ameciclo.org/documentos",
    PERFIL: "https://cms.ameciclo.org/perfil",
    EXECUCAO_CICLOVIARIA: "https://cms.ameciclo.org/execucao-cicloviaria",
    WORKGROUPS: "https://cms.ameciclo.org/workgroups",
  },
  
  // URLs externas
  EXTERNAL_URLS: {
    ASSOCIATION: "http://queroser.ameciclo.org",
    DONATE: "https://apoia.se/ameciclo",
    PARTICIPE: "https://participe.ameciclo.org",
    BOTA_PRA_RODAR: "https://botaprarodar.ameciclo.org"
  }
};

// Status das APIs (pode ser usado para cache/fallback)
export const API_STATUS = {
  CMS: 'unknown', // 'up' | 'down' | 'unknown'
  GARFO: 'unknown',
  IDECICLO: 'unknown'
};