import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prefeituraCountsQueryOptions } from '~/queries/dados.ciclodados';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Pontos de contagem da Prefeitura como GeoJSON para o mapa (as coordenadas do arquivo vêm como [lat, lng]).
export function usePontosContagem(bounds?: ViewportBounds | null) {
  const { data: counts, error } = useQuery(prefeituraCountsQueryOptions());

  const all = useMemo(
    () =>
      counts
        ? {
            type: 'FeatureCollection' as const,
            features: counts.map((ponto, index) => {
              const [lat, lng] = ponto.location.coordinates;
              const total = ponto.summary?.total ?? 0;
              return {
                type: 'Feature' as const,
                geometry: { type: 'Point' as const, coordinates: [lng, lat] },
                properties: {
                  id: `prefeitura_${index}`,
                  name: ponto.name || `Posto ${index + 1}`,
                  city: 'Recife',
                  count: total,
                  total_cyclists: total,
                  date: ponto.date,
                  last_count_date: ponto.date ? new Date(ponto.date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado',
                  cargo_percent: ponto.summary?.cargo_percent ? Math.round(ponto.summary.cargo_percent * 100) : 0,
                  wrong_way_percent: ponto.summary?.wrong_way_percent ? Math.round(ponto.summary.wrong_way_percent * 100) : 0,
                  latitude: lat,
                  longitude: lng,
                  type: 'Contagem',
                  source: 'prefeitura',
                  status: 'active',
                },
              };
            }),
          }
        : null,
    [counts],
  );

  const data = useMemo(() => {
    if (!all || !bounds) return all;
    return {
      ...all,
      features: all.features.filter(({ geometry: { coordinates: [lng, lat] } }) => lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east),
    };
  }, [all, bounds]);

  return { data, error: error ? `Erro ao carregar pontos da prefeitura: ${error.message}` : null };
}
