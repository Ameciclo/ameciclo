import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ciclodadosQueryOptions } from '~/queries/dados.ciclodados';

// Os pontos da pesquisa de perfil por edição (um por ponto e ano), do banco, como GeoJSON para o mapa.
export function usePerfilCiclistas() {
  const { data: base, error, isLoading: loading } = useQuery(ciclodadosQueryOptions());
  const perfil = base?.perfilCiclistas ?? null;

  const data = useMemo(
    () =>
      perfil
        ? {
            type: 'FeatureCollection',
            features: perfil.locations.map((location, index) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [location.coordinates.lon, location.coordinates.lat] },
              properties: {
                id: `profile_${index}`,
                name: location.location_info.street,
                neighborhood: location.location_info.neighborhood,
                area: location.location_info.area,
                survey_year: location.location_info.survey_year,
                total_responses: parseInt(location.statistics.total_responses),
                avg_age: location.statistics.avg_age,
                avg_days_per_week: location.statistics.avg_days_per_week,
                avg_trip_time_minutes: location.statistics.avg_trip_time_minutes,
                male_percentage: location.statistics.gender_distribution.male_percentage,
                female_percentage: location.statistics.gender_distribution.female_percentage,
                private_bike_percentage: location.statistics.private_bike_percentage,
                accidents_percentage: location.statistics.accidents_percentage,
                top_motivation: location.statistics.top_motivation,
                top_issue: location.statistics.top_issue,
                type: 'perfil',
              },
            })),
          }
        : null,
    [perfil],
  );

  return { data, error: error?.message ?? (base && !perfil ? 'Camada indisponível no momento' : null), loading };
}
