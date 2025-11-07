import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useBicicletarios(bounds?: ViewportBounds) {
  return useGenericClusters('http://192.168.10.102:3005/v1/bicycle-racks/geojson', bounds);
}