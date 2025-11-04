import { useState, useEffect, useRef } from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { MiniContagensChart, MiniSinistrosChart, MiniInfraChart } from './utils/chartData';
import { Swiper, SwiperSlide } from 'swiper/react';
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

  const [infraPercentage, setInfraPercentage] = useState(100);
  
  const chartData = [
    {
      id: 1,
      title: "Av. Gov. Agamenon Magalhães",
      value: "2.846",
      description: "contagens de ciclistas (Jan/2024)",
      chart: <MiniContagensChart />
    },
    {
      id: 2,
      title: "Vítimas fatais",
      value: "78",
      chart: <MiniSinistrosChart />
    },
    {
      id: 3,
      title: "Infra. cicloviária executada",
      value: `${infraPercentage}%`,
      chart: <MiniInfraChart onPercentageChange={setInfraPercentage} />
    }
  ];

  return (
    <div style={{height: 'calc(100vh - 64px)'}} className="relative flex flex-col">

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
          {chartData.map((item) => (
            <SwiperSlide key={item.id} className="!w-[280px]">
              <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{item.title}</h3>
                <p className="text-xl font-bold text-black mb-2">{item.value}</p>
                <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}>{item.chart}</div>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}