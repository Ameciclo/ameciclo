import { COUNTINGS_ATLAS_LOCATIONS } from "~/servers";

export async function fetchContagemData(_lat: number, _lon: number) {
  const url = COUNTINGS_ATLAS_LOCATIONS;
  
  try {
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Erro contagem:', error);
    return null; // Return null instead of throwing to prevent timeout
  }
}