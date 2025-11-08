import { useState, useEffect } from 'react';
import { PONTOS_CONTAGEM_DATA } from '~/servers';

interface PontoContagem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
}

interface UsePontosContagemReturn {
  data: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'Point';
        coordinates: [number, number];
      };
      properties: PontoContagem;
    }>;
  } | null;
  loading: boolean;
  error: string | null;
}

export function usePontosContagem(bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
} | null): UsePontosContagemReturn {
  const [data, setData] = useState<UsePontosContagemReturn['data']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bounds) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(PONTOS_CONTAGEM_DATA);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const pontosData: PontoContagem[] = await response.json();
        
        const validPontos = pontosData.filter(ponto => {
          const lat = parseFloat(String(ponto.latitude));
          const lng = parseFloat(String(ponto.longitude));
          
          if (isNaN(lat) || isNaN(lng)) return false;
          if (lat < -9 || lat > -7 || lng < -36 || lng > -33) return false;
          
          return lat >= bounds.south && lat <= bounds.north &&
                 lng >= bounds.west && lng <= bounds.east;
        });
        
        // Converter para GeoJSON
        const geojson = {
          type: 'FeatureCollection' as const,
          features: validPontos.map(ponto => {
            const lat = parseFloat(String(ponto.latitude));
            const lng = parseFloat(String(ponto.longitude));
            
            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number]
              },
              properties: {
                ...ponto,
                latitude: lat,
                longitude: lng
              }
            };
          })
        };
        
        setData(geojson);
      } catch (err) {
        setError('Erro ao carregar pontos de contagem');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bounds]);

  return { data, loading, error };
}