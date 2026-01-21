import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { AMECICLISTAS_DATA, QUEM_SOMOS_DATA } from "~/servers";

export const loader = async () => {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };

  const [ameciclistas, custom] = await Promise.all([
    fetchWithTimeout(AMECICLISTAS_DATA, { cache: "no-cache" }, 15000, null, onError(AMECICLISTAS_DATA)),
    fetchWithTimeout(QUEM_SOMOS_DATA, { cache: "no-cache" }, 15000, null, onError(QUEM_SOMOS_DATA))
  ]);

  let processedAmeciclistas = [];
  let ameciclistasLoading = true;
  
  if (ameciclistas && Array.isArray(ameciclistas["data"])) {
    processedAmeciclistas = ameciclistas["data"].sort((a, b) => a.name.localeCompare(b.name));
    ameciclistasLoading = false;
  }

  let processedCustom = { definition: "", objective: "", links: [] };
  let customLoading = true;
  
  if (custom && custom["data"]) {
    processedCustom = custom["data"];
    customLoading = false;
  }
  
  return json({
    pageData: { 
      ameciclistas: processedAmeciclistas, 
      custom: processedCustom,
      ameciclistasLoading,
      customLoading
    },
    apiErrors: errors
  });
};