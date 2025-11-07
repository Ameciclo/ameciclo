import { useState, useEffect, useRef, useMemo } from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { MiniContagensChart, MiniSinistrosChart, MiniInfraChart } from './utils/chartData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MapPin, Bike } from 'lucide-react';
import { createClusters } from './utils/clustering';
import { useBicicletarios } from './hooks/useBicicletarios';
import 'swiper/css';

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
  bicicletarios: any;
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
}: Omit<MapViewProps, 'bicicletarios'>) {

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [mapViewState, setMapViewState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ciclodados-map-view');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
  
          return parsed;
        } catch (e) {
          console.error('Erro ao parsear localStorage:', e);
        }
      }
    }

    return { latitude: -8.0476, longitude: -34.8770, zoom: 11 };
  });
  const lastLoggedCircle = useRef<string | null>(null);
  const lastClickTime = useRef<number>(0);

  // Salvar posição do mapa no localStorage com debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calcular bounds do viewport atual
  const viewportBounds = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const { latitude, longitude, zoom } = mapViewState;
    const metersPerPixel = 156543.03392 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom);
    const mapWidth = window.innerWidth;
    const mapHeight = window.innerHeight;
    
    const deltaLng = (mapWidth / 2) * metersPerPixel / 111320;
    const deltaLat = (mapHeight / 2) * metersPerPixel / 110540;
    
    return {
      north: latitude + deltaLat,
      south: latitude - deltaLat,
      east: longitude + deltaLng,
      west: longitude - deltaLng
    };
  }, [mapViewState]);

  // Usar hook com bounds para filtrar bicicletários
  const filteredBicicletarios = useBicicletarios(viewportBounds);

  const handleMapViewChange = (viewState: any) => {
    console.log('Mudou posição do mapa:', viewState);
    setMapViewState(viewState);
    
    // Debounce para evitar muitas escritas no localStorage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const dataToSave = {
          latitude: viewState.latitude,
          longitude: viewState.longitude,
          zoom: viewState.zoom
        };
        localStorage.setItem('ciclodados-map-view', JSON.stringify(dataToSave));
        console.log('Salvou no localStorage:', dataToSave);
      }
    }, 500); // Salva 500ms após parar de mover
  };



  // Log das informações para o backend
  useEffect(() => {
    if (selectedPoints.length > 0) {
      const point = selectedPoints[0];
      const pointKey = `${point.lat}-${point.lng}`;
      
      if (lastLoggedCircle.current !== pointKey) {
        console.log('Informações para o backend:', {
          lat: point.lat,
          lng: point.lng,
          radius: 50 // raio fixo de 50m
        });
        lastLoggedCircle.current = pointKey;
      }
    }
  }, [selectedPoints]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleMapMouseDown = (event: any) => {
    if (event.srcEvent) {
      setDragStartPos({ x: event.srcEvent.clientX, y: event.srcEvent.clientY });
      setIsDragging(false);
    }
  };

  const handleMapMouseMove = (event: any) => {
    if (dragStartPos && event.srcEvent) {
      const deltaX = Math.abs(event.srcEvent.clientX - dragStartPos.x);
      const deltaY = Math.abs(event.srcEvent.clientY - dragStartPos.y);
      
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }
    }

    // Lógica original do hover
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

  const handleMapClick = (event: any) => {
    const now = Date.now();
    if (now - lastClickTime.current < 100) return;
    lastClickTime.current = now;
    
    // Se foi um drag, não processar como clique
    if (isDragging) {
      setIsDragging(false);
      setDragStartPos(null);
      return;
    }
    
    // Verificar se o clique veio de um botão ou controle
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
    
    const newPoint = {
      lat,
      lng,
      id: `point-${Date.now()}`
    };
    
    setSelectedPoints([newPoint]);
    setDragStartPos(null);
  };



  const toggleSelectionMode = () => {
    const newSelectionMode = !isSelectionMode;
    setIsSelectionMode(newSelectionMode);
    
    if (!newSelectionMode) {
      // Desativando seleção - limpar tudo
      setHoverPoint(null);
      setSelectedPoints([]);
    }
  };



  return (
    <div style={{height: 'calc(100vh - 64px)'}} className="relative flex flex-col">
      {/* Botão de seleção no canto superior esquerdo */}
      <div className="absolute top-4 left-4 z-[60]">
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-medium transition-all duration-200 ${
            isSelectionMode 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <MapPin size={18} className={isSelectionMode ? 'text-white' : 'text-red-500'} />
          <span className="text-sm">
            {isSelectionMode ? 'Cancelar seleção' : 'Selecionar ponto'}
          </span>
        </button>
      </div>

      <div className="flex-1 md:h-full">
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
        pointsData={[
          ...(contagemData ? contagemData.features.map((feature: any) => ({
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
          })) : []),
          ...(filteredBicicletarios?.features ? 
            createClusters(filteredBicicletarios.features, mapViewState.zoom, mapViewState)
              .map((item: any) => ({
                key: `bicicletario-${item.id}`,
                latitude: item.geometry.coordinates[1],
                longitude: item.geometry.coordinates[0],
                type: 'bicicletario',
                popup: {
                  name: item.isCluster ? `${item.properties.count} Bicicletários` : 'Bicicletário',
                  total: item.isCluster ? 'Cluster' : 'Estacionamento'
                },
                customIcon: item.isCluster ? 
                  <div className="bg-blue-600 text-white rounded-lg min-w-[20px] h-[20px] px-[3px] flex flex-col items-center justify-center shadow-lg border border-white">
                    <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>∩</span>
                    <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>{item.properties.count}</span>
                  </div> :
                  <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-[10px]" style={{textShadow: '0 0 1px white'}}>∩</span>
                  </div>
              })) : [])
        ]}
        showLayersPanel={false}
        width="100%" 
        height="100%" 
        defaultDragPan={!isSelectionMode}
        onMapClick={handleMapClick}
        isSelectionMode={isSelectionMode}
        selectedPoints={selectedPoints.map(point => ({
          ...point,
          customIcon: <MapPin size={20} className="text-red-500" />
        }))}
        hoverPoint={hoverPoint}
        onMouseMove={handleMapMouseMove}
        onMouseDown={handleMapMouseDown}
        initialViewState={mapViewState}
        onViewStateChange={handleMapViewChange}
        showDefaultZoomButton={false}
        controlsSize="small"
        />
      </div>
      
      {/* Bottom panel for mobile with chart data */}
      <div 
        className="md:hidden bg-white border-t p-4 absolute bottom-0 left-0 right-0 z-[70]"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-sm font-medium mb-3">Dados dos Gráficos</h4>
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          className="w-full"
        >
          <SwiperSlide className="!w-[280px]">
            <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Av. Gov. Agamenon Magalhães</h3>
              <p className="text-xl font-bold text-black mb-2">2.846</p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniContagensChart /></div>
              <p className="text-xs text-gray-500">contagens de ciclistas (Jan/2024)</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[280px]">
            <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Vítimas fatais</h3>
              <p className="text-xl font-bold text-black mb-2">78</p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniSinistrosChart /></div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[280px]">
            <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Infra. cicloviária executada</h3>
              <p className="text-xl font-bold text-black mb-2">18%</p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniInfraChart onPercentageChange={() => {}} /></div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}