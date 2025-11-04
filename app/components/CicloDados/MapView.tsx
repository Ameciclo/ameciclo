import { useState, useEffect, useRef } from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";

interface MapViewProps {
  selectedInfra: string[];
  selectedPdc: string[];
  selectedContagem: string[];
  infraOptions: Array<{ name: string; color: string; pattern: string }>;
  pdcOptions: Array<{ name: string; color: string; pattern: string }>;
  layersConf: any[];
  infraData: any;
  pdcData: any;
  contagemData: any;
  getContagemIcon: (count: number) => React.ReactNode;
}

export function MapView({
  selectedInfra,
  selectedPdc,
  selectedContagem,
  layersConf,
  infraData,
  pdcData,
  contagemData,
  getContagemIcon
}: MapViewProps) {
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCircles, setSelectedCircles] = useState<Array<{ lat: number; lng: number; radius: number; id: string }>>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(500); // raio em metros
  const lastLoggedCircle = useRef<string | null>(null);
  const lastClickTime = useRef<number>(0);

  // Log das informações para o backend
  useEffect(() => {
    if (selectedCircles.length > 0) {
      const circle = selectedCircles[0];
      const circleKey = `${circle.lat}-${circle.lng}-${circle.radius}`;
      
      if (lastLoggedCircle.current !== circleKey) {
        console.log('Informações para o backend:', {
          lat: circle.lat,
          lng: circle.lng,
          radius: circle.radius
        });
        lastLoggedCircle.current = circleKey;
      }
    }
  }, [selectedCircles]);

  const handleMapClick = (event: any) => {
    const now = Date.now();
    if (now - lastClickTime.current < 100) return; // Debounce de 100ms
    lastClickTime.current = now;
    
    // Verificar se o clique veio de um botão, elemento de controle ou input range
    if (event.srcEvent) {
      const target = event.srcEvent.target;
      const clickedElement = target.closest('button') || 
                           target.closest('[role="button"]') ||
                           target.closest('input[type="range"]') ||
                           target.matches('input[type="range"]');
      if (clickedElement) {
        return;
      }
    }
    
    if (!isSelectionMode) return;
    
    const lng = event.lngLat[0];
    const lat = event.lngLat[1];
    
    const newCircle = {
      lat,
      lng,
      radius,
      id: `circle-${Date.now()}`
    };
    
    setSelectedCircles([newCircle]);
  };

  const handleMouseMove = (event: any) => {
    if (!isSelectionMode) {
      setHoverPoint(null);
      return;
    }
    
    if (event?.lngLat) {
      const lng = event.lngLat[0];
      const lat = event.lngLat[1];
      setHoverPoint({ lat, lng });
    }
  };

  const toggleSelectionMode = () => {
    const newSelectionMode = !isSelectionMode;
    setIsSelectionMode(newSelectionMode);
    
    if (!newSelectionMode) {
      // Desativando seleção - limpar tudo
      setHoverPoint(null);
      setSelectedCircles([]);
    }
  };

  return (
    <div style={{height: 'calc(100vh - 64px)'}} className="relative">
      {showCoordinates && coordinates.lat && coordinates.lng && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg z-50 border">
          <h3 className="font-semibold text-sm mb-1">Área Selecionada:</h3>
          <p className="text-xs text-gray-600">Lat: {coordinates.lat.toFixed(6)}</p>
          <p className="text-xs text-gray-600">Lng: {coordinates.lng.toFixed(6)}</p>
          <p className="text-xs text-gray-600">Raio: {radius}m</p>
          <button 
            onClick={() => setShowCoordinates(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
      <AmecicloMap
        layerData={(() => {
          const allFeatures = [
            ...(infraData?.features || []),
            ...(pdcData?.features || [])
          ];
          return allFeatures.length > 0 ? {
            type: "FeatureCollection",
            features: allFeatures
          } : null;
        })()}
        layersConf={layersConf || []}
        pointsData={contagemData ? contagemData.features.map((feature: any) => ({
          key: `contagem-${feature.properties.type}`,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          type: feature.properties.type,
          popup: {
            name: feature.properties.location,
            total: feature.properties.count,
            date: "Jan/2024"
          },
          customIcon: getContagemIcon(feature.properties.count)
        })) : []}
        showLayersPanel={false}
        width="100%" 
        height="100%" 
        defaultDragPan={true}
        onMapClick={handleMapClick}
        isSelectionMode={isSelectionMode}
        toggleSelectionMode={toggleSelectionMode}
        radius={radius}
        setRadius={setRadius}
        selectedCircles={selectedCircles}
        hoverPoint={hoverPoint}
        onMouseMove={handleMouseMove}

      />
    </div>
  );
}