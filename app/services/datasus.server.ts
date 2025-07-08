// URLs das APIs do DATASUS
export const DATASUS_SUMMARY_DATA = "https://api.garfo.ameciclo.org/datasus-deaths/summary";
export const DATASUS_CITIES_BY_YEAR_DATA = "https://api.garfo.ameciclo.org/datasus-deaths/cities-by-year";
export const DATASUS_FILTROS_DATA = "https://api.garfo.ameciclo.org/datasus-deaths/filtros";
export const DATASUS_MATRIX_DATA = "https://api.garfo.ameciclo.org/datasus-deaths/matrix";
export const DATASUS_CAUSAS_SECUNDARIAS_DATA = "https://api.garfo.ameciclo.org/datasus-deaths/causas-secundarias";
export const OBSERVATORIO_SINISTROS_PAGE_DATA = "https://do.strapi.ameciclo.org/api/plataformas-de-dados?filters[title][$eq]=Observatório de Sinistros Fatais&populate[0]=supportfiles&populate[1]=supportfiles.file&populate[2]=supportfiles.cover&populate[3]=cover&populate[4]=explanationbox";

// Função para buscar dados do resumo geral
export async function fetchDatasusSummary() {
  const response = await fetch(DATASUS_SUMMARY_DATA, { cache: "no-cache" });
  if (!response.ok) throw new Error("Erro ao buscar resumo DATASUS");
  return response.json();
}

// Função para buscar dados de cidades por ano
export async function fetchDatasusCitiesByYear(params?: URLSearchParams) {
  const url = params ? `${DATASUS_CITIES_BY_YEAR_DATA}?${params}` : DATASUS_CITIES_BY_YEAR_DATA;
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error("Erro ao buscar dados de cidades por ano");
  return response.json();
}

// Função para buscar dados da página do Strapi
export async function fetchSinistrosFataisPageData() {
  try {
    const response = await fetch(OBSERVATORIO_SINISTROS_PAGE_DATA, { cache: "no-cache" });
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data?.data?.[0]) return null;
    
    const platformData = data.data[0];
    const supportFiles = platformData.supportfiles?.map(file => ({
      title: file.title || "Documento",
      description: file.description || "",
      url: file.file?.url || "#",
      src: file.cover?.url || "/icons/document.svg"
    })) || [];
    
    return {
      id: platformData.id,
      title: platformData.title,
      coverImage: platformData.cover?.url || "/images/covers/sinistros-fatais.jpg",
      explanationBoxes: platformData.explanationbox?.map(box => ({
        title: box.title,
        description: box.text
      })) || [],
      supportFiles
    };
  } catch (error) {
    console.error("Erro ao buscar dados do Strapi:", error);
    return null;
  }
}