import { useState, useEffect } from 'react';
import { fetchExecucaoCicloviaria } from '~/services/execucaoCicloviaria.service';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useExecucaoCicloviaria(bounds?: ViewportBounds) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    
    fetchExecucaoCicloviaria()
      .then(result => {
        
        // Handle direct FeatureCollection or byCity structure
        let cityData = result;
        
        // If it's wrapped in byCity structure, extract it
        if (result?.byCity?.['2611606']) {
          cityData = result.byCity['2611606'];
        }
        
        if (cityData?.type === 'FeatureCollection' && cityData?.features) {
          const processedData = {
            ...cityData,
            features: cityData.features.map((feature: any) => ({
              ...feature,
              properties: {
                ...feature.properties,
                source: 'execucao',
                status: feature.properties.status_type || feature.properties.status // Map status_type to status or use existing status
              }
            }))
          };
          setData(processedData);
        } else {
          setData(null);
        }
      })
      .catch(err => {
        console.error('Erro no hook useExecucaoCicloviaria:', err);
        setError(err.message || 'Erro ao carregar dados de execução cicloviária');
        setData(null);
      });
  }, []);

  return { data, error };
}