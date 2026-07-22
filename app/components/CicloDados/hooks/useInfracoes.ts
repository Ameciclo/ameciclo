import { useState, useEffect, useRef, useMemo } from 'react';
import { TRAFFIC_VIOLATIONS_GEOJSON } from '~/servers';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useInfracoes(bounds?: ViewportBounds, selectedFilters?: string[], startYear?: string, endYear?: string) {
  const [rawData, setRawData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasFilters = (selectedFilters && selectedFilters.length > 0) ?? false;
  const filtersKey = selectedFilters?.join(',') ?? '';

  useEffect(() => {
    if (!hasFilters) {
      setRawData(null);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);

    const params = new URLSearchParams({ cyclist: "true", category: "Risco a vulneráveis", limit: "100" });

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
        setRawData(geojson);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        console.error('Erro ao carregar dados de infrações:', err);
        setError(err.message || 'Erro ao carregar dados de infrações');
        setRawData(null);
      });

    return () => controller.abort();
  }, [hasFilters, filtersKey, selectedFilters]);

  const data = useMemo(() => {
    if (!rawData || !rawData.features || rawData.features.length === 0) return null;
    const sy = parseInt(startYear || '2007');
    const ey = parseInt(endYear || '2025');
    
    const featuresWithTotals = rawData.features.map((feature: any) => {
      const byYear = feature.properties.by_year || {};
      let total = 0;
      for (let y = sy; y <= ey; y++) {
        total += byYear[String(y)] || 0;
      }
      return { feature, total };
    });

    const sorted = [...featuresWithTotals].sort((a, b) => a.total - b.total);
    const n = sorted.length;
    const p33 = sorted[Math.floor(n * 0.33)]?.total ?? 0;
    const p66 = sorted[Math.floor(n * 0.66)]?.total ?? 0;

    return {
      ...rawData,
      features: featuresWithTotals.map(({ feature, total }: { feature: any; total: number }) => ({
        ...feature,
        properties: {
          ...feature.properties,
          total_violations: total,
          severity: total >= p66 ? 'high' : total >= p33 ? 'medium' : 'low',
        },
      })),
      thresholds: { low: p33, medium: p66 },
    };
  }, [rawData, startYear, endYear]);

  return { data, error };
}
