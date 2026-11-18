import { useQuery } from '@tanstack/react-query';
import { perfilPointsQueryOptions } from '~/queries/dados.ciclodados';

// `anos`: as edições marcadas no painel (o MapView ainda as chama de `genero`); os outros são rótulos ou "Todas".
interface PerfilFilters {
  anos: string[];
  raca?: string;
  socio?: string;
  dias?: string;
}

const label = (value: string) => (value && value !== 'Todas' ? value : undefined);

// Os pontos de entrevista da pesquisa de perfil, do banco, com o total de entrevistas que passa nos filtros.
// Antes, quando o filtro zerava um ponto, o hook "simulava" um número a partir do total; agora o ponto mostra o que há.
export function usePerfilPoints(
  _bounds?: { north: number; south: number; east: number; west: number } | null,
  filters?: PerfilFilters,
) {
  const { data, isLoading: loading, error } = useQuery(perfilPointsQueryOptions({ anos: filters?.anos.map(Number).filter(Number.isInteger), raca: label(filters?.raca ?? ''), socio: label(filters?.socio ?? ''), dias: label(filters?.dias ?? '') }));
  const points = data?.points ?? null;
  return {
    data: points ? { features: points } : null,
    loading,
    error: error?.message || (data && !points ? 'Camada indisponível no momento' : null),
  };
}
