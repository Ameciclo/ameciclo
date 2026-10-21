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
  
  // Filtrar apenas RMR (Região Metropolitana do Recife)
  const filteredData = result.data ? {
    ...result.data,
    features: result.data.features?.filter((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      return lat >= -8.3 && lat <= -7.8 && lng >= -35.1 && lng <= -34.8;
    })
  } : result.data;
  
  return { data: filteredData, error: result.error };
}