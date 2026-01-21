import { useGenericClusters } from './useGenericClusters';
import { SERVERS } from '~/servers';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useInfraCicloviaria(bounds?: ViewportBounds, selectedTypes?: string[]) {
  const result = useGenericClusters(SERVERS.INFRA_CICLOVIARIA, bounds);
  return { data: result.data, error: result.error };
}