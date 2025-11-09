import { useState, useEffect, useRef, useMemo } from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { MiniContagensChart, MiniSinistrosChart, MiniInfraChart } from './utils/chartData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MapPin, Bike } from 'lucide-react';
import { createClusters } from './utils/clustering';
import { useBicicletarios } from './hooks/useBicicletarios';
import { useBikePE } from './hooks/useBikePE';
import { useInfraCicloviaria } from './hooks/useInfraCicloviaria';
import { usePontosContagem } from './hooks/usePontosContagem';
import { useExecucaoCicloviaria } from './hooks/useExecucaoCicloviaria';
import { useSinistros } from './hooks/useSinistros';
import { DataErrorAlert } from './DataErrorAlert';
import { ApiStatusIndicator } from './ApiStatusIndicator';

import 'swiper/css';

interface MapViewProps {
  selectedInfra: string[];
  selectedPdc: string[];
  selectedContagem: string[];
  selectedEstacionamento: string[];
  selectedSinistro: string[];
  infraOptions: Array<{ name: string; color: string; pattern: string }>;
  pdcOptions: Array<{ name: string; color: string; pattern: string; apiKey?: string }>;
  layersConf: any[];
  infraData: any;
  pdcData: any;
  contagemData: any;
  getContagemIcon: (count: number) => React.ReactNode;
  bicicletarios: any;
  onPointClick?: (point: any) => void;
  externalViewState?: {latitude: number, longitude: number, zoom: number};
  highlightedStreet?: any;
  streetData?: any;
}

export function MapView({
  selectedInfra,
  selectedPdc,
  selectedContagem,
  selectedEstacionamento,
  selectedSinistro,
  layersConf,
  infraData,
  pdcData,
  contagemData,
  getContagemIcon,
  pdcOptions,
  onPointClick,
  externalViewState,
  highlightedStreet,
  streetData
}: Omit<MapViewProps, 'bicicletarios'>) {

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [dragPanEnabled, setDragPanEnabled] = useState(true);
  const [clusterTooltip, setClusterTooltip] = useState<{ show: boolean; count: number; x: number; y: number }>({ show: false, count: 0, x: 0, y: 0 });
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

  const [forceRender, setForceRender] = useState(0);

  // Atualizar com estado externo quando fornecido
  useEffect(() => {
    if (externalViewState) {
      console.log('MapView recebeu externalViewState:', externalViewState);
      console.log('MapView estado atual:', mapViewState);
      setMapViewState(externalViewState);
      setForceRender(Date.now()); // Força re-renderização
    }
  }, [externalViewState]);

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

  // Verificar se está no cliente
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Usar hooks com bounds para filtrar dados apenas no cliente
  const { data: filteredBicicletarios, error: bicicletariosError } = useBicicletarios(isClient ? viewportBounds : undefined);
  const { data: filteredBikePE, error: bikePEError } = useBikePE(isClient ? viewportBounds : undefined);
  const { data: infraCicloviaria, error: infraError } = useInfraCicloviaria(isClient ? viewportBounds : undefined, selectedInfra);
  const { data: pontosContagem, error: pontosContagemError } = usePontosContagem(isClient ? viewportBounds : undefined);
  const { data: execucaoCicloviaria, error: execucaoError } = useExecucaoCicloviaria(isClient ? viewportBounds : undefined);
  const { data: sinistrosData, error: sinistrosError } = useSinistros(isClient ? viewportBounds : undefined);
  
  // Debug logs
  useEffect(() => {
    console.log('selectedPdc:', selectedPdc);
    console.log('execucaoCicloviaria:', execucaoCicloviaria);
    console.log('execucaoError:', execucaoError);
  }, [selectedPdc, execucaoCicloviaria, execucaoError]);
  
  // Coletar erros para exibir avisos
  const dataErrors = [];
  if (bicicletariosError) dataErrors.push({ type: 'bicicletarios', message: bicicletariosError });
  if (bikePEError) dataErrors.push({ type: 'bikepe', message: bikePEError });
  if (infraError) dataErrors.push({ type: 'infraestrutura', message: infraError });
  if (pontosContagemError) dataErrors.push({ type: 'pontos-contagem', message: pontosContagemError });
  if (execucaoError) dataErrors.push({ type: 'execucao-cicloviaria', message: execucaoError });
  if (sinistrosError) dataErrors.push({ type: 'sinistros', message: sinistrosError });

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
    
    if (newSelectionMode) {
      // Ao ativar seleção, desabilitar drag pan
      setDragPanEnabled(false);
    } else {
      // Ao desativar seleção, reabilitar drag pan
      setDragPanEnabled(true);
      setHoverPoint(null);
      setSelectedPoints([]);
    }
  };
  
  const toggleDragPan = () => {
    setDragPanEnabled(!dragPanEnabled);
  };
  
  const handleReloadAllData = () => {
    window.location.reload();
  };

  return (
    <div style={{height: 'calc(100vh - 64px)'}} className="relative flex flex-col">
      {/* Botão no canto superior esquerdo */}
      <div className="absolute top-4 left-4 z-[60] flex gap-2">
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
          onPointClick={onPointClick}
          layerData={(() => {
            // Filtrar infraestrutura por tipos selecionados
            const filteredInfraFeatures = infraCicloviaria?.features?.filter((feature: any) => 
              selectedInfra.includes(feature.properties.infra_type)
            ) || [];
            
            // Filtrar execução cicloviária por status selecionados
            const selectedPdcApiKeys = selectedPdc.map(name => {
              const option = pdcOptions.find(opt => opt.name === name);
              return option?.apiKey;
            }).filter(Boolean);
            
            const filteredExecucaoFeatures = (!execucaoError && execucaoCicloviaria?.features) ? 
              execucaoCicloviaria.features.filter((feature: any) => 
                selectedPdcApiKeys.includes(feature.properties.status)
              ) : [];
            
            // Filtrar sinistros por tipos selecionados
            const filteredSinistrosFeatures = sinistrosData?.features?.filter((feature: any) => 
              selectedSinistro.includes(feature.properties.type)
            ) || [];
            
            const allFeatures = [
              ...(infraData?.features || []),
              ...(pdcData?.features || []),
              ...filteredInfraFeatures,
              ...filteredExecucaoFeatures,
              ...filteredSinistrosFeatures,
              ...(highlightedStreet?.features || [])
            ];
            
            return allFeatures.length > 0 ? {
              type: "FeatureCollection",
              features: allFeatures
            } : null;
          })()}
        layersConf={[
          ...(layersConf || []),
          // Highlighted street from search
          ...(highlightedStreet ? [{
            id: 'highlighted-street',
            type: 'line',
            source: 'data',
            filter: ['==', ['get', 'highlighted'], true],
            paint: {
              'line-color': '#ff0000',
              'line-width': 8,
              'line-opacity': 0.8
            }
          }] : [])
        ]}
        pointsData={[
          // Pontos de contagem da API com clustering
          ...(isClient && selectedContagem.length > 0 && pontosContagem?.features && Array.isArray(pontosContagem.features) ? 
            createClusters(pontosContagem.features.map(f => ({
              ...f,
              geometry: { coordinates: [f.properties.longitude, f.properties.latitude] }
            })), mapViewState.zoom, mapViewState)
              .map((item: any) => {
                const totalContagens = item.isCluster ? 
                  item.properties.items.reduce((sum: number, f: any) => sum + (f.properties.total_cyclists || f.properties.count || 0), 0) :
                  (item.properties.items?.[0]?.properties?.total_cyclists || item.properties.items?.[0]?.properties?.count || 0);
                
                const scaleSize = mapViewState.zoom < 12 ? 0.7 : mapViewState.zoom < 14 ? 0.85 : 1;
                
                return {
                  key: `contagem-${item.id}`,
                  latitude: item.geometry.coordinates[1],
                  longitude: item.geometry.coordinates[0],
                  type: 'Contagem',
                  popup: {
                    name: item.isCluster ? `${item.properties.count} Pontos de Contagem` : 
                          (item.properties.items?.[0]?.properties?.name || 'Ponto de Contagem'),
                    total: totalContagens,
                    date: item.properties.items?.[0]?.properties?.last_count_date,
                    city: item.properties.items?.[0]?.properties?.city,
                    created_at: item.properties.items?.[0]?.properties?.last_count_date,
                    latitude: item.geometry.coordinates[1],
                    longitude: item.geometry.coordinates[0]
                  },
                  customIcon: (
                    <div className="relative" style={{ transform: `scale(${scaleSize})` }}>
                      <div className="bg-white text-black px-2 py-1 rounded-lg shadow-lg border-2 border-black flex items-center gap-1 min-w-[50px] justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M3 3v18h18"/>
                          <path d="M18 17V9"/>
                          <path d="M13 17V5"/>
                          <path d="M8 17v-3"/>
                        </svg>
                        <span className="text-xs font-bold">{totalContagens}</span>
                        {item.isCluster && item.properties.count > 1 && (
                          <span 
                            className="text-[8px] bg-white text-black border border-black rounded-full px-1 ml-1 cursor-help relative"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setClusterTooltip({
                                show: true,
                                count: item.properties.count,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 5
                              });
                            }}
                            onMouseLeave={() => setClusterTooltip({ show: false, count: 0, x: 0, y: 0 })}
                          >
                            {item.properties.count}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-1px]">
                          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
                        </div>
                      </div>
                    </div>
                  ),
                  onClick: () => onPointClick && onPointClick(item.isCluster ? item : item.properties.items[0])
                };
              }) : []),

          ...(isClient && selectedEstacionamento.includes('Bicicletários') && filteredBicicletarios?.features && Array.isArray(filteredBicicletarios.features) ? 
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
              })) : []),
          ...(isClient && selectedEstacionamento.includes('Estações de Bike PE') && filteredBikePE?.features && Array.isArray(filteredBikePE.features) ? 
            createClusters(filteredBikePE.features, mapViewState.zoom, mapViewState)
              .map((item: any) => ({
                key: `bikepe-${item.id}`,
                latitude: item.geometry.coordinates[1],
                longitude: item.geometry.coordinates[0],
                type: 'bikepe',
                popup: {
                  name: item.isCluster ? `${item.properties.count} Estações Bike PE` : 'Estação Bike PE',
                  total: item.isCluster ? 'Cluster' : 'Bicicletas compartilhadas'
                },
                customIcon: item.isCluster ? 
                  <div className="bg-orange-500 text-white rounded-lg min-w-[20px] h-[20px] px-[3px] flex flex-col items-center justify-center shadow-lg border border-white">
                    <Bike size={8} className="text-white" />
                    <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>{item.properties.count}</span>
                  </div> :
                  <div className="bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                    <Bike size={10} className="text-white" />
                  </div>
              })) : [])
        ]}
        showLayersPanel={false}
        width="100%" 
        height="100%" 
        defaultDragPan={dragPanEnabled}
        isSelectionMode={isSelectionMode}
        toggleSelectionMode={toggleSelectionMode}
        toggleDragPan={toggleDragPan}
        dragPanEnabled={dragPanEnabled}
        onMapClick={handleMapClick}
        selectedPoints={selectedPoints.map(point => ({
          ...point,
          customIcon: <MapPin size={20} className="text-red-500" />
        }))}
        hoverPoint={hoverPoint}
        onMouseMove={handleMapMouseMove}
        onMouseDown={handleMapMouseDown}
        initialViewState={externalViewState || mapViewState}
        onViewStateChange={handleMapViewChange}
        showDefaultZoomButton={false}
        controlsSize="small"
        key={`map-${forceRender}`}
        />
      </div>
      
      {/* Bottom panel for mobile with chart data */}
      <div 
        className="md:hidden bg-white border-t p-4 absolute left-0 right-0 z-[70]" 
        style={{ bottom: '80px' }}
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
              <h3 className="font-medium text-gray-800 mb-1 text-sm">
                {streetData?.street_name || 'Av. Gov. Agamenon Magalhães'}
              </h3>
              <p className="text-xl font-bold text-black mb-2">
                {streetData?.data_summary?.cycling_counts || '2.846'}
              </p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniContagensChart /></div>
              <p className="text-xs text-gray-500">contagens de ciclistas</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[280px]">
            <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Perfil de ciclistas</h3>
              <p className="text-xl font-bold text-black mb-2">
                {streetData?.data_summary?.cycling_profile || '0'}
              </p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniSinistrosChart /></div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!w-[280px]">
            <div className="w-[280px] h-[120px] border rounded-lg p-3 shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Chamadas de emergência</h3>
              <p className="text-xl font-bold text-black mb-2">
                {streetData?.data_summary?.emergency_calls || '1158'}
              </p>
              <div className="h-12 mb-2" style={{ pointerEvents: 'none' }}><MiniInfraChart onPercentageChange={() => {}} /></div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      
      <ApiStatusIndicator errors={dataErrors} onReload={handleReloadAllData} />
      
      {/* Cluster Tooltip */}
      {clusterTooltip.show && (
        <div 
          className="fixed z-[100] bg-black text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            left: clusterTooltip.x,
            top: clusterTooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {clusterTooltip.count} pontos de contagem agrupados
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      )}
    </div>
  );
}