import { racksQueryOptions } from '~/queries/dados.ciclodados';
import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Bicicletários do OpenStreetMap, do banco.
export function useBicicletarios(bounds?: ViewportBounds | null) {
  return useGenericClusters(racksQueryOptions(), (r) => r.places, bounds);
}
