import { useMemo } from 'react';
import { cyclingMapQueryOptions } from '~/queries/dados.ciclodados';
import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// A estrutura cicloviária existente (Ciclovia, Ciclofaixa, Ciclorrota, Calçada compartilhada), do banco: só os trechos que
// têm tipologia construída, com `infra_type` na propriedade que o mapa filtra.
export function useInfraCicloviaria(bounds?: ViewportBounds | null) {
  const { data, error } = useGenericClusters(cyclingMapQueryOptions(), (r) => r.map, bounds);
  const built = useMemo(() => (data ? { ...data, features: data.features.filter((f) => f.properties?.infra_type) } : null), [data]);
  return { data: built, error };
}
