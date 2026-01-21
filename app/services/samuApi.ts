import { SAMU_ATLAS_BASE } from "~/servers";

export async function fetchCityOutcomes(city: string) {
  try {
    const response = await fetch(`${SAMU_ATLAS_BASE}/calls/outcomes?city=${city}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar outcomes para ${city}:`, error);
    return null;
  }
}

export async function fetchCityProfiles(city: string, startYear?: number, endYear?: number) {
  try {
    let url = `${SAMU_ATLAS_BASE}/calls/profiles?city=${city}`;
    if (startYear) url += `&start_year=${startYear}`;
    if (endYear) url += `&end_year=${endYear}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar profiles para ${city}:`, error);
    return null;
  }
}
