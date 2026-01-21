/**
 * Serviço de Geocodificação
 * 
 * Converte nomes de ruas em coordenadas geográficas usando APIs públicas.
 * Usa Nominatim (OSM) como principal e Mapbox como fallback.
 */

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  boundingbox?: [string, string, string, string]; // [south, north, west, east]
}

interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Busca coordenadas usando Nominatim (OpenStreetMap)
 */
async function geocodeWithNominatim(streetName: string, city: string = 'Recife'): Promise<GeocodingResult | null> {
  try {
    const query = `${streetName}, ${city}, Pernambuco, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Ameciclo-Platform/1.0 (contato@ameciclo.org)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      boundingbox: data[0].boundingbox
    };
  } catch (error) {
    console.error('Erro no Nominatim:', error);
    return null;
  }
}

/**
 * Busca coordenadas usando Mapbox (fallback)
 */
async function geocodeWithMapbox(streetName: string, city: string = 'Recife'): Promise<GeocodingResult | null> {
  try {
    const token = typeof window !== 'undefined' 
      ? window.ENV?.MAPBOX_ACCESS_TOKEN 
      : process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!token) return null;

    const query = `${streetName}, ${city}, PE`;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=br&limit=1`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      lat: feature.center[1],
      lon: feature.center[0],
      display_name: feature.place_name,
      boundingbox: feature.bbox ? [
        feature.bbox[1].toString(),
        feature.bbox[3].toString(),
        feature.bbox[0].toString(),
        feature.bbox[2].toString()
      ] : undefined
    };
  } catch (error) {
    console.error('Erro no Mapbox:', error);
    return null;
  }
}

/**
 * Busca coordenadas de uma rua (tenta Nominatim primeiro, depois Mapbox)
 */
export async function geocodeStreet(streetName: string, city: string = 'Recife'): Promise<{
  coordinates: { lat: number; lng: number };
  bounds: GeoBounds;
  displayName: string;
} | null> {
  // Tentar Nominatim primeiro
  let result = await geocodeWithNominatim(streetName, city);
  
  // Se falhar, tentar Mapbox
  if (!result) {
    result = await geocodeWithMapbox(streetName, city);
  }
  
  if (!result) return null;

  // Calcular bounds (área ao redor do ponto)
  let bounds: GeoBounds;
  
  if (result.boundingbox) {
    bounds = {
      south: parseFloat(result.boundingbox[0]),
      north: parseFloat(result.boundingbox[1]),
      west: parseFloat(result.boundingbox[2]),
      east: parseFloat(result.boundingbox[3])
    };
  } else {
    // Se não tiver boundingbox, criar uma área de ~500m ao redor do ponto
    const offset = 0.005; // ~500m
    bounds = {
      north: result.lat + offset,
      south: result.lat - offset,
      east: result.lon + offset,
      west: result.lon - offset
    };
  }

  return {
    coordinates: {
      lat: result.lat,
      lng: result.lon
    },
    bounds,
    displayName: result.display_name
  };
}

/**
 * Cache de geocodificação para evitar requisições repetidas
 */
const geocodeCache = new Map<string, ReturnType<typeof geocodeStreet>>();

export async function geocodeStreetCached(streetName: string, city: string = 'Recife'): Promise<ReturnType<typeof geocodeStreet>> {
  const cacheKey = `${streetName}-${city}`.toLowerCase();
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }
  
  const result = await geocodeStreet(streetName, city);
  geocodeCache.set(cacheKey, Promise.resolve(result));
  
  return result;
}
