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
    const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(query)}`;
    console.log('🔍 Buscando vias na URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Dados recebidos:', data);
    
    // A API retorna sinistros, precisamos extrair ruas únicas
    if (data.sinistros && Array.isArray(data.sinistros)) {
      // Extrair ruas únicas dos sinistros
      const streetsMap = new Map<string, StreetMatch>();
      
      data.sinistros.forEach((sinistro: any) => {
        const streetName = sinistro.nome_oficial_logradouro;
        const neighborhood = sinistro.nomeBairro;
        
        if (streetName && !streetsMap.has(streetName)) {
          streetsMap.set(streetName, {
            id: `street-${streetName.replace(/\s+/g, '-').toLowerCase()}`,
            name: streetName,
            confidence: 0.9,
            municipality: neighborhood || 'Recife',
            length: undefined
          });
        }
      });
      
      const results = Array.from(streetsMap.values());
      console.log('✅ Ruas únicas extraídas:', results);
      return results;
    }
    
    console.log('⚠️ Formato de dados não reconhecido:', data);
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar vias:', error);
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