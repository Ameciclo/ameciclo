export function useProcessedData(contagemData: any, perfilCiclistas: any) {
  const processedPerfilData = perfilCiclistas?.locations ? {
    type: 'FeatureCollection',
    features: perfilCiclistas.locations.map((location: any, index: number) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.coordinates.lon, location.coordinates.lat]
      },
      properties: {
        id: `profile_${index}`,
        name: location.location_info.street,
        neighborhood: location.location_info.neighborhood,
        area: location.location_info.area,
        survey_year: String(location.location_info.survey_year),
        total_responses: parseInt(location.statistics.total_responses),
        avg_age: location.statistics.avg_age,
        male_percentage: location.statistics.gender_distribution.male_percentage,
        female_percentage: location.statistics.gender_distribution.female_percentage,
        accidents_percentage: location.statistics.accidents_percentage,
        top_motivation: location.statistics.top_motivation,
        type: 'perfil'
      }
    }))
  } : null;

  const processedContagemData = contagemData ? {
    type: 'FeatureCollection',
    features: [
      ...(contagemData.ameciclo || []).map((ponto: any) => {
        const lat = parseFloat(ponto.latitude);
        const lng = parseFloat(ponto.longitude);
        const latestCount = ponto.counts?.[0];
        const totalCyclists = latestCount?.total_cyclists || 0;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: `ameciclo_${ponto.id}`,
            name: ponto.name,
            city: ponto.city,
            count: totalCyclists,
            total_cyclists: totalCyclists,
            type: 'Contagem',
            source: 'ameciclo',
            last_count_date: (() => {
              const date = latestCount?.date || latestCount?.created_at || ponto.created_at;
              return date ? new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado';
            })(),
            mulheres: latestCount?.women || latestCount?.mulheres || 0,
            carona: latestCount?.passengers || latestCount?.carona || 0,
            servico: latestCount?.service || latestCount?.servico || 0,
            cargueira: latestCount?.cargo || latestCount?.cargueira || 0,
            contramao: latestCount?.wrong_way || latestCount?.contramao || 0,
            calcada: latestCount?.sidewalk || latestCount?.calcada || 0,
            criancas: latestCount?.children || latestCount?.criancas || 0,
            capacete: latestCount?.helmet || latestCount?.capacete || 0
          }
        };
      }),
      ...(contagemData.prefeitura || []).map((ponto: any, index: number) => {
        const lat = parseFloat(ponto.coordinates?.latitude || 0);
        const lng = parseFloat(ponto.coordinates?.longitude || 0);
        const totalCyclists = ponto.total_cyclists || 0;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: `prefeitura_${index}`,
            name: ponto.name || `Ponto ${index + 1}`,
            city: 'Recife',
            count: totalCyclists,
            total_cyclists: totalCyclists,
            type: 'Contagem',
            source: 'prefeitura',
            last_count_date: (() => {
              const date = ponto.date || ponto.created_at;
              return date ? new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado';
            })()
          }
        };
      })
    ]
  } : null;

  return {
    processedPerfilData,
    processedContagemData
  };
}
