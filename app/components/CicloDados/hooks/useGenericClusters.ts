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

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        // Converter para GeoJSON se for array de estações
        if (Array.isArray(data)) {
          const geojson = {
            type: "FeatureCollection",
            features: data.map((station: any) => {
              // Extrair coordenadas do WKB hex
              let coords = [-34.8770, -8.0476]; // fallback
              if (station.coordinates) {
                try {
                  // WKB format: extrair os últimos 16 bytes que contêm lng e lat
                  const hex = station.coordinates.replace('0101000000', '');
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
                properties: { ...station, id: station.id || index }
              };
            })
          };
          setAllData(geojson);
        } else {
          setAllData(data);
        }
      })
      .catch(console.error);
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
        const [lng, lat] = feature.geometry.coordinates;
        return lat >= bounds.south && lat <= bounds.north && 
               lng >= bounds.west && lng <= bounds.east;
      })
    };

    setFilteredData(filtered);
  }, [allData, bounds]);

  return filteredData;
}