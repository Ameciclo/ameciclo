import { useState, useEffect } from 'react';
import type { StreetDataSummary } from '~/services/streets.service';
import { getStreetDataSummary } from '~/services/streets.service';

interface MapSelection {
  lat: number;
  lng: number;
  radius: number;
  street?: string;
  pointData?: any;
}

interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export function useCicloDadosMap(initialViewState: MapViewState | null) {
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(null);
  const [autoOpenPopup, setAutoOpenPopup] = useState<{lat: number, lng: number} | null>(null);
  const [selectedStreetGeometry, setSelectedStreetGeometry] = useState<any>(null);
  const [selectedStreetData, setSelectedStreetData] = useState<StreetDataSummary | null>(null);
  const [selectedStreetFilter, setSelectedStreetFilter] = useState<string | null>(null);
  
  // Inicializar com dados da URL, localStorage ou padrão
  const getInitialViewState = (): MapViewState => {
    // Priority 1: URL params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');
      const zoom = url.searchParams.get('zoom');
      
      if (lat && lon && zoom) {
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          zoom: parseFloat(zoom)
        };
      }
    }
    
    // Priority 2: localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ciclodados-map-view');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Ignora erro
        }
      }
    }
    
    // Priority 3: initialViewState from loader
    if (initialViewState) return initialViewState;
    
    // Priority 4: default
    return { latitude: -8.0476, longitude: -34.8770, zoom: 11 };
  };
  
  const [mapViewState, setMapViewState] = useState<MapViewState>(getInitialViewState());
  
  // Atualizar URL e localStorage quando o mapa mudar
  const updateMapView = (newViewState: MapViewState) => {
    setMapViewState(newViewState);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados-map-view', JSON.stringify(newViewState));
      
      const url = new URL(window.location.href);
      
      // Preserve all existing params
      const newUrl = new URL(url.origin + url.pathname);
      newUrl.searchParams.set('lat', newViewState.latitude.toFixed(6));
      newUrl.searchParams.set('lon', newViewState.longitude.toFixed(6));
      newUrl.searchParams.set('zoom', newViewState.zoom.toFixed(0));
      
      // Copy all other params
      url.searchParams.forEach((value, key) => {
        if (key !== 'lat' && key !== 'lon' && key !== 'zoom') {
          newUrl.searchParams.set(key, value);
        }
      });
      
      window.history.replaceState({}, '', newUrl.toString());
    }
  };

  const handleMapSelection = (coords: MapSelection) => {
    setMapSelection(coords);
  };

  const handlePointClick = (point: any) => {
    let lat, lng, name, totalCyclists;
    
    if (point.latitude && point.longitude) {
      lat = point.latitude;
      lng = point.longitude;
      name = point.popup?.name || point.popup?.location || 'Ponto de Contagem';
      totalCyclists = point.popup?.total || point.popup?.count || 0;
    } else if (point.geometry?.coordinates) {
      lng = point.geometry.coordinates[0];
      lat = point.geometry.coordinates[1];
      name = point.properties?.name || point.properties?.location || 'Ponto de Contagem';
      totalCyclists = point.properties?.count || point.properties?.total_cyclists || 0;
    } else {
      console.error('❌ Estrutura do ponto:', Object.keys(point));
      return;
    }
    
    const coords = { 
      lat, 
      lng, 
      radius: 500, 
      street: name,
      pointData: {
        name,
        totalCyclists,
        ...point
      }
    };
    handleMapSelection(coords);
  };

  const handleZoomToStreet = async (
    bounds: {north: number, south: number, east: number, west: number}, 
    coordinates?: {lat: number, lng: number} | null,
    streetId?: string, 
    streetName?: string
  ) => {
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15;
    if (maxDiff > 0.01) zoom = 13;
    else if (maxDiff > 0.005) zoom = 14;
    else if (maxDiff > 0.002) zoom = 15;
    
    updateMapView({
      latitude: centerLat,
      longitude: centerLng,
      zoom
    });
    
    if (!streetName) {
      setMapSelection(null);
      setSelectedStreetGeometry(null);
      setSelectedStreetFilter(null);
      setAutoOpenPopup(null);
    } else {
      // Usar coordenadas fornecidas ou centro dos bounds
      const pointLat = coordinates?.lat || centerLat;
      const pointLng = coordinates?.lng || centerLng;
      
      setMapSelection({
        lat: pointLat,
        lng: pointLng,
        radius: 500,
        street: streetName
      });
      setSelectedStreetGeometry(null);
      setSelectedStreetFilter(streetName);
      
      // Abrir popup automaticamente no ponto
      setAutoOpenPopup({ lat: pointLat, lng: pointLng });
    }
    
    if (streetId) {
      try {
        const streetData = await getStreetDataSummary(streetId);
        setSelectedStreetData(streetData);
      } catch (error) {
        console.error('Erro ao buscar dados da via:', error);
      }
    }
  };

  const handleZoomIn = () => {
    updateMapView({
      ...mapViewState,
      zoom: Math.min(mapViewState.zoom + 2, 22)
    });
  };

  const handleZoomOut = () => {
    updateMapView({
      ...mapViewState,
      zoom: Math.max(mapViewState.zoom - 2, 1)
    });
  };

  const handleMapMove = (newViewState: MapViewState) => {
    updateMapView(newViewState);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const modal = url.searchParams.get('modal');
    
    if (lat && lon && modal === 'open') {
      setAutoOpenPopup({ lat: parseFloat(lat), lng: parseFloat(lon) });
    }
  }, []);

  useEffect(() => {
    const handleDemoSelection = () => {
      handleMapSelection({
        lat: -8.0476,
        lng: -34.8770,
        radius: 1000,
        street: "Av. Gov. Agamenon Magalhães"
      });
    };
    
    window.addEventListener('demo-map-selection', handleDemoSelection);
    return () => window.removeEventListener('demo-map-selection', handleDemoSelection);
  }, []);

  return {
    mapSelection,
    mapViewState,
    autoOpenPopup,
    selectedStreetGeometry,
    selectedStreetData,
    selectedStreetFilter,
    handleMapSelection,
    handlePointClick,
    handleZoomToStreet,
    handleZoomIn,
    handleZoomOut,
    handleMapMove,
    setAutoOpenPopup
  };
}
