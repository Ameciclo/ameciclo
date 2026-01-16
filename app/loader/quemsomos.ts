import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { AMECICLISTAS_DATA, QUEM_SOMOS_DATA } from "~/servers";

export const loader = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  try {
    const [ameciclistas, custom] = await Promise.all([
      fetchWithTimeout(AMECICLISTAS_DATA, { cache: "no-cache" }, 15000, [], onError(AMECICLISTAS_DATA)),
      fetchWithTimeout(
        QUEM_SOMOS_DATA,
        { cache: "no-cache" },
        15000,
        { definition: "Associação Metropolitana de Ciclistas do Recife", objective: "Promover a mobilidade ativa", links: [] },
        onError(QUEM_SOMOS_DATA)
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
    let processedAmeciclistas = ameciclistas["data"];
    if (Array.isArray(processedAmeciclistas)) {
      processedAmeciclistas.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      console.error("Data received for /ameciclistas is not an array:", processedAmeciclistas);
      processedAmeciclistas = [];
    }

    // Extract custom data from the response
    const processedCustom = custom["data"] || custom;
    
    return json({
      pageData: { ameciclistas: processedAmeciclistas, custom: processedCustom },
      isLoading: false,
      apiDown: false,
      apiErrors: []
    });
  } catch (error) {
    console.error("Error fetching or processing data for Quem Somos:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return json({
      pageData: null,
      isLoading: true,
      apiDown: true,
      apiErrors: [{ url: AMECICLISTAS_DATA, error: errorMessage || 'Erro desconhecido' }]
    });
  }
};