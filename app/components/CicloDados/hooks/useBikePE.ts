import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useBikePE(bounds?: ViewportBounds) {
  return useGenericClusters('http://192.168.10.102:3015/v1/stations/', bounds);
}