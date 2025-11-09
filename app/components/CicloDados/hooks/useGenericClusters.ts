import { useState, useEffect } from 'react';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useGenericClusters(apiUrl: string, bounds?: ViewportBounds) {
  const [allData, setAllData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    console.log('Tentando carregar dados de:', apiUrl);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('Resposta da API:', res.status, res.statusText);
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('Dados recebidos:', data?.type, data?.features?.length || 'sem features');
        // Verificar se é GeoJSON direto ou array que precisa ser convertido
        if (data.type === 'FeatureCollection') {
          // Já é GeoJSON, usar diretamente
          // Para dados de execução cicloviária, adicionar propriedade source
          if (apiUrl.includes('ways/all-ways')) {
            data.features = data.features.map((feature: any) => ({
              ...feature,
              properties: {
                ...feature.properties,
                source: 'execucao'
              }
            }));
          }
          setAllData(data);
        } else if (Array.isArray(data)) {
          // Array que precisa ser convertido para GeoJSON
          const geojson = {
            type: "FeatureCollection",
            features: data.map((item: any, index: number) => {
              // Se já tem geojson, usar diretamente
              if (item.geojson) {
                return item.geojson;
              }
              
              // Senão, extrair coordenadas do WKB hex (estações)
              let coords = [-34.8770, -8.0476]; // fallback
              if (item.coordinates) {
                try {
                  // WKB format: extrair os últimos 16 bytes que contêm lng e lat
                  const hex = item.coordinates.replace('0101000000', '');
                  const lngHex = hex.substring(0, 16);
                  const latHex = hex.substring(16, 32);
                  
                  // Converter de little-endian hex para float64
                  const lngBuffer = new ArrayBuffer(8);
                  const lngView = new DataView(lngBuffer);
                  for (let i = 0; i < 8; i++) {
                    lngView.setUint8(i, parseInt(lngHex.substring(i * 2, i * 2 + 2), 16));
                  }
                  
                  const latBuffer = new ArrayBuffer(8);
                  const latView = new DataView(latBuffer);
                  for (let i = 0; i < 8; i++) {
                    latView.setUint8(i, parseInt(latHex.substring(i * 2, i * 2 + 2), 16));
                  }
                  
                  const lng = lngView.getFloat64(0, true);
                  const lat = latView.getFloat64(0, true);
                  
                  if (!isNaN(lng) && !isNaN(lat)) {
                    coords = [lng, lat];
                  }
                } catch (e) {
                  console.warn('Erro ao decodificar coordenadas:', e);
                }
              }
              
              return {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: coords
                },
                properties: { 
                  ...item, 
                  id: item.id || index,
                  source: apiUrl.includes('ways/all-ways') ? 'execucao' : 'default'
                }
              };
            })
          };
          setAllData(geojson);
        } else {
          setAllData(data);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar dados de', apiUrl, ':', err);
        setError(`${err.message || 'Erro ao carregar dados'} (${apiUrl})`);
        setAllData(null);
      });
  }, [apiUrl]);

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
        // Para LineString (infraestrutura), não filtrar por viewport
        if (feature.geometry.type === 'LineString') {
          return true;
        }
        
        // Para Point (estações), filtrar por viewport
        const [lng, lat] = feature.geometry.coordinates;
        return lat >= bounds.south && lat <= bounds.north && 
               lng >= bounds.west && lng <= bounds.east;
      })
    };

    setFilteredData(filtered);
  }, [allData, bounds]);

  return { data: filteredData, error };
}