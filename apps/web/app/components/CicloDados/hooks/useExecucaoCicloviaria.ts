import { useMemo } from 'react';
import { cyclingMapQueryOptions } from '~/queries/dados.ciclodados';
import { useGenericClusters } from './useGenericClusters';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// A execução do PDC, do banco: cada trecho com o `status` (pdc_realizado_designado, pdc_realizado_nao_designado,
// realizado_fora_pdc, pdc_nao_realizado) que as camadas do PDC filtram.
export function useExecucaoCicloviaria(bounds?: ViewportBounds | null) {
  const { data, error } = useGenericClusters(cyclingMapQueryOptions(), (r) => r.map, bounds);
  const execution = useMemo(
    () =>
      data
        ? {
            ...data,
            features: data.features.filter((f) => f.properties?.status).map((f) => ({ ...f, properties: { ...f.properties, source: 'execucao' } })),
          }
        : null,
    [data],
  );
  return { data: execution, error };
}
