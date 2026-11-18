import { searchStreetsFn } from '~/queries/dados.ciclodados';

export interface StreetMatch {
  id: string;
  name: string;
  municipality: string;
  length?: number;
  coordinates?: { lat: number; lng: number };
  bounds?: { north: number; south: number; east: number; west: number };
}

// Dentro da Região Metropolitana do Recife, para aceitar "lat, lng" digitado na busca.
const inRmr = (lat: number, lng: number) => lat >= -8.5 && lat <= -7.5 && lng >= -35.5 && lng <= -34.5;

// Busca de logradouro pelo nome na malha viária do Recife (banco). Também aceita coordenadas ("-8.05, -34.88").
export async function searchStreets(query: string): Promise<StreetMatch[]> {
  const text = query.trim();
  if (text.length < 2) return [];

  const coordinates = text.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (coordinates) {
    const lat = parseFloat(coordinates[1]);
    const lng = parseFloat(coordinates[2]);
    if (!inRmr(lat, lng)) return [];
    const margin = 0.005;
    return [
      {
        id: `ponto-${lat}-${lng}`,
        name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        municipality: 'Recife',
        coordinates: { lat, lng },
        bounds: { north: lat + margin, south: lat - margin, east: lng + margin, west: lng - margin },
      },
    ];
  }

  try {
    const hits = await searchStreetsFn({ data: { query: text } });
    return hits.map((hit) => ({
      id: hit.key,
      name: hit.name,
      municipality: 'Recife',
      length: hit.lengthM,
      coordinates: { lat: hit.lat, lng: hit.lng },
      bounds: hit.bounds,
    }));
  } catch (error) {
    console.error('Erro na busca de rua:', error);
    return [];
  }
}
