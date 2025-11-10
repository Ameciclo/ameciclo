import { useState, useEffect } from 'react';
import { PONTOS_CONTAGEM_DATA } from '~/servers';

interface PontoContagem {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  counts: Array<{
    id: number;
    date: string;
    total_cyclists: number;
    start_time: string;
    end_time: string;
  }>;
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

export function usePontosContagem(): UsePontosContagemReturn {
  const [data, setData] = useState<UsePontosContagemReturn['data']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(PONTOS_CONTAGEM_DATA);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const pontosData: PontoContagem[] = await response.json();
        
        // Converter para GeoJSON
        const geojson = {
          type: 'FeatureCollection' as const,
          features: pontosData.map(ponto => {
            const lat = parseFloat(ponto.latitude);
            const lng = parseFloat(ponto.longitude);
            
            // Pegar o total de ciclistas do último count
            const totalCyclists = ponto.counts && ponto.counts.length > 0 
              ? ponto.counts[0].total_cyclists 
              : 0;
            
            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number]
              },
              properties: {
                id: ponto.id,
                name: ponto.name,
                city: ponto.city,
                count: totalCyclists,
                total_cyclists: totalCyclists,
                total_counts: ponto.counts?.length || 0,
                last_count_date: ponto.counts?.[0]?.date || null,
                latitude: lat,
                longitude: lng,
                type: 'Contagem',
                status: 'active'
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
  }, []);

  return { data, loading, error };
}