import { API_CONFIG } from '~/config/api';

export interface StreetMatch {
  id: string;
  name: string;
  confidence: number;
  municipality: string;
  length?: number;
}

export interface StreetSearchResponse {
  matches: StreetMatch[];
}

export interface StreetDetails {
  id: string;
  name: string;
  geometry: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'MultiLineString';
        coordinates: number[][][];
      };
      properties: Record<string, any>;
    }>;
  };
  properties: Record<string, any>;
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

export async function getStreetDetails(streetId: string): Promise<StreetDetails | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.STREETS_API_BASE_URL}/v1/streets/${streetId}`,
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

    const data: StreetDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da via:', error);
    return null;
  }
}