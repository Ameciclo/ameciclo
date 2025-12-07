import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { CMS_BASE_URL } from "~/servers";

export const loader = async () => {
  const server = CMS_BASE_URL;
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  try {
    const [ameciclistas, custom] = await Promise.all([
      fetchWithTimeout(`${server}/ameciclistas`, { cache: "no-cache" }, 15000, [], onError(`${server}/ameciclistas`)),
      fetchWithTimeout(
        `${server}/quem-somos`,
        { cache: "no-cache" },
        15000,
        { definition: "Associação Metropolitana de Ciclistas do Recife", objective: "Promover a mobilidade ativa", links: [] },
        onError(`${server}/quem-somos`)
      )
    ]);

    // Check if we have API errors
    const hasApiError = errors.length > 0 || !ameciclistas || !custom;
    
    if (hasApiError) {
      return json({
        pageData: null,
        isLoading: true,
        apiDown: true,
        apiErrors: errors
      });
    }

    // Defensive check to ensure ameciclistas is an array before sorting
    let processedAmeciclistas = ameciclistas;
    if (Array.isArray(processedAmeciclistas)) {
      processedAmeciclistas.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      console.error("Data received for /ameciclistas is not an array:", processedAmeciclistas);
      processedAmeciclistas = [];
    }
    
    return json({
      pageData: { ameciclistas: processedAmeciclistas, custom },
      isLoading: false,
      apiDown: false,
      apiErrors: []
    });
  } catch (error) {
    console.error("Error fetching or processing data for Quem Somos:", error);
    return json({
      pageData: null,
      isLoading: true,
      apiDown: true,
      apiErrors: [{ url: server, error: error.message || 'Erro desconhecido' }]
    });
  }
};