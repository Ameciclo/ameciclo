import { stationsQueryOptions } from '~/queries/dados.ciclodados';
import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Estações de Bike PE do OpenStreetMap, do banco.
export function useBikePE(bounds?: ViewportBounds | null) {
  return useGenericClusters(stationsQueryOptions(), (r) => r.places, bounds);
}
