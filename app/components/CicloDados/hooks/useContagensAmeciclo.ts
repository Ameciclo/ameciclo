import { useState, useEffect } from 'react';
import { COUNTINGS_ATLAS_LOCATIONS } from '~/servers';

export function useContagensAmeciclo() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    fetch(COUNTINGS_ATLAS_LOCATIONS, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((pontos: any[]) => {
        const geojson = {
          type: 'FeatureCollection' as const,
          features: pontos.map((ponto, index) => {
            const lat = parseFloat(ponto.latitude);
            const lng = parseFloat(ponto.longitude);
            const latestCount = ponto.counts?.[0];
            const totalCyclists = latestCount?.total_cyclists || 0;

            const char = latestCount?.characteristics || {};

            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number],
              },
              properties: {
                id: `ameciclo_${ponto.id || index}`,
                name: ponto.name || `Ponto ${index + 1}`,
                city: ponto.city || 'Recife',
                count: totalCyclists,
                total_cyclists: totalCyclists,
                type: 'Contagem',
                source: 'ameciclo',
                last_count_date: latestCount?.date
                  ? new Date(latestCount.date).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: '2-digit',
                    })
                  : 'Sem dado',
                mulheres: char.women || 0,
                carona: char.ride || 0,
                servico: char.service || 0,
                cargueira: char.cargo || 0,
                contramao: char.wrong_way || 0,
                calcada: char.sidewalk || 0,
                criancas: char.juveniles || 0,
                capacete: char.helmet || 0,
                motor: char.motor || 0,
                chuva: char.rain || 0,
                other_behaviors: char.other_behaviors || 0,
                latitude: lat,
                longitude: lng,
              },
            };
          }),
        };

        setData(geojson);
      })
      .catch((err) => {
        console.error('Erro ao carregar contagens da Ameciclo:', err);
        setError(`Erro ao carregar contagens da Ameciclo: ${err.message}`);
        setData(null);
      });
  }, []);

  return { data, error };
}
