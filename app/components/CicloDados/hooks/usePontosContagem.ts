import { useState, useEffect } from 'react';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function usePontosContagem(bounds?: ViewportBounds) {
  const [allData, setAllData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    console.log('Carregando pontos de contagem da prefeitura do arquivo estático');
    
    fetch('/dbs/PCR_CONTAGENS.json')
      .then(res => {
        console.log('Resposta do arquivo estático:', res.status, res.statusText);
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((pontosData: any[]) => {
        console.log('Dados da prefeitura recebidos:', pontosData?.length || 'sem dados');
        
        // Converter para GeoJSON
        const geojson = {
          type: "FeatureCollection" as const,
          features: pontosData.map((ponto, index) => {
            const lat = ponto.location.coordinates[0];
            const lng = ponto.location.coordinates[1];
            const totalCyclists = ponto.summary?.total || 0;
            
            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number]
              },
              properties: {
                id: `prefeitura_${index}`,
                name: ponto.name || `Posto ${index + 1}`,
                city: 'Recife',
                count: totalCyclists,
                total_cyclists: totalCyclists,
                date: ponto.date,
                last_count_date: ponto.date ? new Date(ponto.date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado',
                cargo_percent: ponto.summary?.cargo_percent ? Math.round(ponto.summary.cargo_percent * 100) : 0,
                wrong_way_percent: ponto.summary?.wrong_way_percent ? Math.round(ponto.summary.wrong_way_percent * 100) : 0,
                latitude: lat,
                longitude: lng,
                type: 'Contagem',
                source: 'prefeitura',
                status: 'active'
              }
            };
          })
        };
        
        setAllData(geojson);
      })
      .catch(err => {
        console.error('Erro ao carregar pontos da prefeitura:', err);
        setError(`Erro ao carregar pontos da prefeitura: ${err.message}`);
        setAllData(null);
      });
  }, []);

  useEffect(() => {
    if (!allData || !bounds) {
      setFilteredData(allData);
      return;
    }

    if (!allData.features || !Array.isArray(allData.features)) {
      setFilteredData(allData);
      return;
    }

    const filtered = {
      ...allData,
      features: allData.features.filter((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        return lat >= bounds.south && lat <= bounds.north && 
               lng >= bounds.west && lng <= bounds.east;
      })
    };

    setFilteredData(filtered);
  }, [allData, bounds]);

  return { data: filteredData, error };
}