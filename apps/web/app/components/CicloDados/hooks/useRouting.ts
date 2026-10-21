import { useState } from 'react';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    properties: {
      distance: number;
      duration: number;
    };
  }>;
}

export function useRouting() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (start: RoutePoint, end: RoutePoint) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usando OpenRouteService API (gratuita)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/cycling-regular?` +
        `start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
        {
          headers: {
            'Authorization': '5b3ce3597851110001cf6248a1b2c8c7c4e04c7bb4b8b4e4c8f8c8c8' // API key pública de exemplo
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erro ao calcular rota');
      }
      
      const data = await response.json();
      
      const routeFeature = {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          geometry: data.features[0].geometry,
          properties: {
            distance: data.features[0].properties.segments[0].distance,
            duration: data.features[0].properties.segments[0].duration
          }
        }]
      };
      
      setRouteData(routeFeature);
    } catch (err) {
      console.error('Erro ao calcular rota:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteData(null);
    setError(null);
  };

  return { routeData, loading, error, calculateRoute, clearRoute };
}