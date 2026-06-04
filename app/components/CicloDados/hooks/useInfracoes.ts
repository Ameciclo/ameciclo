import { useState, useEffect, useRef } from 'react';
import { TRAFFIC_VIOLATIONS_GEOJSON } from '~/servers';
import { TODAS_INFRACOES } from './useCicloDadosData';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function deriveSeverity(count: number): string {
  if (count >= 500) return 'high';
  if (count >= 150) return 'medium';
  return 'low';
}

export function useInfracoes(bounds?: ViewportBounds, selectedFilters?: string[]) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasFilters = (selectedFilters && selectedFilters.length > 0) ?? false;
  const filtersKey = selectedFilters?.join(',') ?? '';

  useEffect(() => {
    if (!hasFilters) {
      setData(null);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);

    const isTodas = selectedFilters.includes(TODAS_INFRACOES);
    const params = new URLSearchParams({ limit: "100" });
    if (!isTodas) {
      params.append('category', 'Ciclistas');
    }

    fetch(`${TRAFFIC_VIOLATIONS_GEOJSON}?${params}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(geojson => {
        if (controller.signal.aborted) return;
        if (geojson.type === 'FeatureCollection' && geojson.features) {
          const features = geojson.features.map((feature: any) => ({
            ...feature,
            properties: {
              ...feature.properties,
              severity: deriveSeverity(feature.properties.total_violations ?? 0)
            }
          }));
          setData({ ...geojson, features });
        } else {
          setData(geojson);
        }
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        console.error('Erro ao carregar dados de infrações:', err);
        setError(err.message || 'Erro ao carregar dados de infrações');
        setData(null);
      });

    return () => controller.abort();
  }, [hasFilters, filtersKey, selectedFilters]);

  return { data, error };
}
