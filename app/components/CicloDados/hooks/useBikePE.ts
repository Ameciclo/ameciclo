import { useGenericClusters } from './useGenericClusters';
import { BIKE_PE_STATIONS_DATA } from '~/servers';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useBikePE(bounds?: ViewportBounds) {
  const result = useGenericClusters(BIKE_PE_STATIONS_DATA, bounds);
  return { data: result.data, error: result.error };
}