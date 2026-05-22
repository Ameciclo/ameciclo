import { useState, useEffect } from 'react';
import { VIAS_INSEGURAS_MAP } from '~/servers';
import { getSinistroTotal } from './useCicloDadosData';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function deriveSeverity(count: number): string {
  if (count >= 150) return 'high';
  if (count >= 50) return 'medium';
  return 'low';
}

export function useSinistros(_bounds?: ViewportBounds) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    fetch(VIAS_INSEGURAS_MAP, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(geojson => {
        if (geojson.type === 'FeatureCollection' && geojson.features) {
          const featuresWithSeverity = geojson.features.map((feature: any) => ({
            ...feature,
            properties: {
              ...feature.properties,
              severity: deriveSeverity(getSinistroTotal(feature.properties))
            }
          }));
          setData({ ...geojson, features: featuresWithSeverity });
        } else {
          setData(geojson);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar dados de sinistros:', err);
        setError(err.message || 'Erro ao carregar dados de sinistros');
        setData(null);
      });
  }, []);

  return { data, error };
}
