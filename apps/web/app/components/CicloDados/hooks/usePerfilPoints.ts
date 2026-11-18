import { useQuery } from '@tanstack/react-query';
import { perfilPointsQueryOptions } from '~/queries/dados.ciclodados';

interface PerfilFilters {
  genero: string;
  raca: string;
  socio: string;
  dias: string;
}

// Os pontos de entrevista da pesquisa de perfil, do banco, com o total de entrevistas que passa nos filtros.
// Antes, quando o filtro zerava um ponto, o hook "simulava" um número a partir do total; agora o ponto mostra o que há.
export function usePerfilPoints(
  _bounds?: { north: number; south: number; east: number; west: number } | null,
  filters?: PerfilFilters,
) {
  const { data, isLoading: loading, error } = useQuery(perfilPointsQueryOptions({ genero: filters?.genero, raca: filters?.raca, socio: filters?.socio, dias: filters?.dias }));
  const points = data?.points ?? null;
  return {
    data: points ? { features: points } : null,
    loading,
    error: error?.message || (data && !points ? 'Camada indisponível no momento' : null),
  };
}
