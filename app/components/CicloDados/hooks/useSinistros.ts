import { useState, useEffect } from 'react';
import { VIAS_INSEGURAS_MAP } from '~/servers';
import { getSinistroTotal, getCategoryKeys } from './useCicloDadosData';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function deriveSeverityByCount(count: number): string {
  if (count >= 150) return 'high';
  if (count >= 50) return 'medium';
  return 'low';
}

function deriveSeverityByProportion(proportion: number): string {
  if (proportion > 0.15) return 'high';
  if (proportion > 0.07) return 'medium';
  return 'low';
}

export function useSinistros(_bounds?: ViewportBounds, selectedSinistro: string[] = []) {
  const [rawData, setRawData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
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
        setRawData(geojson);
      })
      .catch(err => {
        console.error('Erro ao carregar dados de sinistros:', err);
        setError(err.message || 'Erro ao carregar dados de sinistros');
        setRawData(null);
      });
  }, []);

  useEffect(() => {
    if (!rawData?.features) {
      setData(rawData);
      return;
    }

    const selectedKeys = getCategoryKeys(selectedSinistro);
    const allCategoriesSelected = selectedSinistro.length >= 5;

    const features = rawData.features.map((feature: any) => {
      const cats = feature.properties.accidents_by_category || {};
      const selectedTotal = selectedKeys.reduce((sum, key) => sum + (cats[key] || 0), 0);
      const totalCount = getSinistroTotal(feature.properties);

      let severity: string;
      if (allCategoriesSelected) {
        severity = deriveSeverityByCount(totalCount);
      } else if (totalCount === 0) {
        severity = 'low';
      } else {
        const proportion = selectedTotal / totalCount;
        severity = deriveSeverityByProportion(proportion);
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          severity
        }
      };
    });

    setData({ ...rawData, features });
  }, [rawData, selectedSinistro]);

  return { data, error };
}
