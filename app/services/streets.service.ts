import { VIAS_INSEGURAS_SEARCH } from '~/servers';

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

export interface StreetDataSummary {
  street_id: string;
  street_name: string;
  data_summary: {
    cycling_counts: string;
    cycling_profile: number;
    emergency_calls: string;
  };
}

export async function searchStreets(query: string): Promise<StreetMatch[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${VIAS_INSEGURAS_SEARCH}?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Adaptar resposta da API do SAMU para o formato esperado
    if (Array.isArray(data)) {
      return data.map((street: any) => ({
        id: street.id || street.street_id || String(Math.random()),
        name: street.name || street.street_name || '',
        confidence: 0.8, // valor fixo já que a API não retorna confidence
        municipality: street.city || 'Recife',
        length: street.length
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar vias:', error);
    return [];
  }
}

export async function getStreetDetails(streetId: string): Promise<StreetDetails | null> {
  try {
    // Por enquanto, retornar dados mock já que não temos endpoint específico
    // TODO: Implementar quando houver endpoint real
    return {
      id: streetId,
      name: 'Via selecionada',
      geometry: {
        type: 'FeatureCollection',
        features: []
      },
      properties: {
        totalLength: 1000
      }
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes da via:', error);
    return null;
  }
}

export async function getStreetDataSummary(streetId: string): Promise<StreetDataSummary | null> {
  try {
    // Por enquanto, retornar dados mock já que não temos endpoint específico
    // TODO: Implementar quando houver endpoint real
    return {
      street_id: streetId,
      street_name: 'Via selecionada',
      data_summary: {
        cycling_counts: '150',
        cycling_profile: 25,
        emergency_calls: '45'
      }
    };
  } catch (error) {
    console.error('Erro ao buscar resumo de dados da via:', error);
    return null;
  }
}