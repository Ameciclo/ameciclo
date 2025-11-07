import { useState, useEffect } from 'react';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useBicicletarios(bounds?: ViewportBounds) {
  const [allData, setAllData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    fetch('http://192.168.10.102:3005/v1/bicycle-racks/geojson')
      .then(res => res.json())
      .then(setAllData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!allData || !bounds) {
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