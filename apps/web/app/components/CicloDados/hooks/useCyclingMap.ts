import { useQuery } from '@tanstack/react-query';
import { cyclingMapQueryOptions } from '~/queries/dados.ciclodados';

// Os trechos de via do mapa (estrutura construída e situação no PDC), do banco. Um conjunto só: as camadas de
// infraestrutura e do PDC leem as mesmas geometrias e se separam pelos filtros (ver utils/cyclingLayers.ts).
export function useCyclingMap() {
  const { data: response, error: failure } = useQuery(cyclingMapQueryOptions());
  const map = response?.map ?? null;
  const error = failure ? 'Erro ao carregar a camada' : response && !map ? 'Camada indisponível no momento' : null;
  return { data: map, error };
}
