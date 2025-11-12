export function createClusters(features: any[], zoom: number, viewport?: { latitude: number, longitude: number, zoom: number }) {
  // Calculate actual viewport bounds based on screen dimensions and zoom
  const visibleFeatures = viewport && typeof window !== 'undefined' ? features.filter(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    
    // Calculate meters per pixel at current zoom and latitude
    const metersPerPixel = 156543.03392 * Math.cos(viewport.latitude * Math.PI / 180) / Math.pow(2, zoom);
    
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate actual viewport bounds in degrees
    const latRange = (screenHeight * metersPerPixel) / 111320; // ~111320 meters per degree latitude
    const lngRange = (screenWidth * metersPerPixel) / (111320 * Math.cos(viewport.latitude * Math.PI / 180));
    
    // Add small buffer (10% of viewport)
    const latBuffer = latRange * 0.1;
    const lngBuffer = lngRange * 0.1;
    
    return lat >= (viewport.latitude - latRange/2 - latBuffer) &&
           lat <= (viewport.latitude + latRange/2 + latBuffer) &&
           lng >= (viewport.longitude - lngRange/2 - lngBuffer) &&
           lng <= (viewport.longitude + lngRange/2 + lngBuffer);
  }) : features;
  
  if (zoom >= 16) {
    // At high zoom, prevent overlap with minimal displacement
    const minDistance = 0.0001; // ~11 meters
    const adjustedFeatures = [];
    
    for (let i = 0; i < visibleFeatures.length; i++) {
      const feature = visibleFeatures[i];
      let [lng, lat] = feature.geometry.coordinates;
      
      // Check for collisions with already placed points
      let collision = true;
      let attempts = 0;
      const maxAttempts = 8;
      
      while (collision && attempts < maxAttempts) {
        collision = false;
        
        for (const placed of adjustedFeatures) {
          const [placedLng, placedLat] = placed.geometry.coordinates;
          const distance = Math.sqrt(
            Math.pow(lng - placedLng, 2) + Math.pow(lat - placedLat, 2)
          );
          
          if (distance < minDistance) {
            collision = true;
            // Micro-adjust position in a spiral pattern
            const angle = (attempts * Math.PI * 2) / maxAttempts;
            lng = feature.geometry.coordinates[0] + Math.cos(angle) * minDistance * (attempts + 1) * 0.5;
            lat = feature.geometry.coordinates[1] + Math.sin(angle) * minDistance * (attempts + 1) * 0.5;
            break;
          }
        }
        attempts++;
      }
      
      adjustedFeatures.push({
        ...feature,
        geometry: { coordinates: [lng, lat] },
        isCluster: false,
        id: i,
        properties: {
          ...feature.properties,
          items: [feature]
        }
      });
    }
    
    return adjustedFeatures;
  }
  
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