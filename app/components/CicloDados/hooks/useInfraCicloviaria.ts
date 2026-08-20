import { useGenericClusters } from './useGenericClusters';
import { INFRA_CICLOVIARIA_DATA } from '~/servers';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useInfraCicloviaria(bounds?: ViewportBounds, selectedTypes?: string[]) {
  const result = useGenericClusters(INFRA_CICLOVIARIA_DATA, bounds);
  return { data: result.data, error: result.error };
}