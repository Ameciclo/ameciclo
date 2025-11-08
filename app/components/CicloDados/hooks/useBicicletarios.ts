import { useGenericClusters } from './useGenericClusters';
import { BICICLETARIOS_DATA } from '~/servers';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useBicicletarios(bounds?: ViewportBounds) {
  const result = useGenericClusters(BICICLETARIOS_DATA, bounds);
  return { data: result.data, error: result.error };
}