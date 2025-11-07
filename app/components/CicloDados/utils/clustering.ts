export function createClusters(features: any[], zoom: number, viewport?: { latitude: number, longitude: number, zoom: number }) {
  // Filter features within viewport bounds
  const margin = zoom < 10 ? 0.5 : zoom < 12 ? 0.2 : 0.1; // Much larger margin for lower zoom
  const visibleFeatures = viewport ? features.filter(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    return Math.abs(lat - viewport.latitude) < margin && 
           Math.abs(lng - viewport.longitude) < margin;
  }) : features;
  
  if (zoom >= 16) return visibleFeatures.map((f, i) => ({ ...f, isCluster: false, id: i }));
  
  const gridSize = zoom < 10 ? 0.05 : zoom < 12 ? 0.02 : zoom < 14 ? 0.01 : 0.005;
  const clusters: any = {};
  
  visibleFeatures.forEach((feature, index) => {
    const [lng, lat] = feature.geometry.coordinates;
    const gridX = Math.floor(lng / gridSize);
    const gridY = Math.floor(lat / gridSize);
    const key = `${gridX}-${gridY}`;
    
    if (!clusters[key]) {
      clusters[key] = {
        geometry: { coordinates: [lng, lat] },
        properties: { count: 0, items: [] },
        isCluster: true,
        id: key
      };
    }
    
    clusters[key].properties.count++;
    clusters[key].properties.items.push(feature);
  });
  
  return Object.values(clusters);
}