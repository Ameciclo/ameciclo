import { API_CONFIG } from '~/config/api';

export interface StreetMatch {
  id: string;
  name: string;
  confidence: number;
  municipality: string;
}

export interface StreetSearchResponse {
  matches: StreetMatch[];
}

export async function searchStreets(query: string): Promise<StreetMatch[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${API_CONFIG.STREETS_API_BASE_URL}/v1/streets/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_CONFIG.FAST_TIMEOUT),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StreetSearchResponse = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Erro ao buscar vias:', error);
    return [];
  }
}