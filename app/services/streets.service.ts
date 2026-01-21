import { geocodeStreetCached } from './geocoding.service';

export interface StreetMatch {
  id: string;
  name: string;
  confidence: number;
  municipality: string;
  length?: number;
  coordinates?: { lat: number; lng: number };
  bounds?: { north: number; south: number; east: number; west: number };
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

/**
 * Busca ruas usando Nominatim (OpenStreetMap)
 * Retorna apenas ruas da Região Metropolitana do Recife
 */
export async function searchStreets(query: string): Promise<StreetMatch[]> {
  if (!query.trim() || query.length < 2) return [];
  
  // Detectar coordenadas (formato: -8.05, -34.9 ou -8.05 -34.9)
  const coordPattern = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
  const coordMatch = query.trim().match(coordPattern);
  
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    if (lat >= -8.5 && lat <= -7.5 && lng >= -35.5 && lng <= -34.5) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Ameciclo-Platform/1.0 (contato@ameciclo.org)' },
          signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) return [];
        const data = await response.json();
        
        if (data.address?.road) {
          return [{
            id: `street-${data.place_id}`,
            name: data.address.road,
            confidence: 2.0,
            municipality: data.address.city || data.address.town || 'Recife',
            coordinates: { lat, lng },
            bounds: data.boundingbox ? {
              south: parseFloat(data.boundingbox[0]),
              north: parseFloat(data.boundingbox[1]),
              west: parseFloat(data.boundingbox[2]),
              east: parseFloat(data.boundingbox[3])
            } : { north: lat + 0.005, south: lat - 0.005, east: lng + 0.005, west: lng - 0.005 }
          }];
        }
      } catch (error) {
        console.error('❌ Erro na busca reversa:', error);
      }
    }
    return [];
  }
  
  try {
    const searchQuery = `${query}, Região Metropolitana do Recife, Pernambuco, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=50&countrycodes=br&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Ameciclo-Platform/1.0 (contato@ameciclo.org)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return [];

    const data = await response.json();
    const queryLower = query.toLowerCase().trim();
    
    const streets = data
      .filter((item: any) => {
        const type = item.type || item.class;
        const isStreet = ['road', 'residential', 'primary', 'secondary', 'tertiary', 'unclassified', 'living_street', 'pedestrian'].includes(type);
        const hasAddress = item.address && (item.address.road || item.address.street);
        return isStreet || hasAddress;
      })
      .map((item: any) => {
        const streetName = item.address?.road || item.display_name.split(',')[0];
        const city = item.address?.city || item.address?.town || item.address?.municipality || 'Recife';
        const streetNameLower = streetName.toLowerCase();
        
        let relevance = 0;
        if (streetNameLower.includes(queryLower)) {
          relevance = 1.0;
          if (streetNameLower.startsWith(queryLower)) {
            relevance = 1.5;
          }
          if (streetNameLower === queryLower) {
            relevance = 2.0;
          }
        }
        
        return {
          id: `street-${item.place_id}`,
          name: streetName,
          confidence: relevance,
          municipality: city,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          },
          bounds: item.boundingbox ? {
            south: parseFloat(item.boundingbox[0]),
            north: parseFloat(item.boundingbox[1]),
            west: parseFloat(item.boundingbox[2]),
            east: parseFloat(item.boundingbox[3])
          } : undefined
        };
      })
      .filter((street: StreetMatch) => street.confidence > 0)
      .sort((a: StreetMatch, b: StreetMatch) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
    
    return streets;
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