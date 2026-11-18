import { useMemo } from 'react';
import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type Feature = { geometry: { type: string; coordinates: unknown }; properties?: Record<string, unknown> | null };
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

// Uma camada GeoJSON do banco, filtrada pelo que está à vista: as linhas (infraestrutura) ficam todas, os pontos
// (bicicletários, estações) só os do retângulo do mapa. `select` tira da resposta do servidor a coleção da camada.
export function useGenericClusters<R, K extends QueryKey>(
  options: UseQueryOptions<R, Error, R, K>,
  select: (response: R) => FeatureCollection | null,
  bounds?: ViewportBounds | null,
) {
  const { data: response, error: failure } = useQuery(options);
  const all = response ? select(response) : null;

  const data = useMemo(() => {
    if (!all || !bounds) return all;
    return {
      ...all,
      features: all.features.filter((feature) => {
        const { type, coordinates } = feature.geometry;
        if (type !== 'Point' || !Array.isArray(coordinates)) return true;
        const [lng, lat] = coordinates;
        return typeof lat === 'number' && typeof lng === 'number' && lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
      }),
    };
  }, [all, bounds]);

  // Camada que o servidor não conseguiu ler: a resposta chega, mas sem coleção.
  const error = failure ? 'Erro ao carregar a camada' : response && !all ? 'Camada indisponível no momento' : null;
  return { data, error };
}
