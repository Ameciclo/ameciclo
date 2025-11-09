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
  pdcOptions: Array<{ name: string; color: string; pattern: string }>;
  layersConf: any[];
  infraData: any;
  pdcData: any;
  contagemData: any;
  getContagemIcon: (count: number) => React.ReactNode;
  bicicletarios: any;
  onPointClick?: (point: any) => void;
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
  onPointClick
}: Omit<MapViewProps, 'bicicletarios'> & { pdcOptions: Array<{ name: string; apiKey: string }> }) {

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [dragPanEnabled, setDragPanEnabled] = useState(true);
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
              ...filteredSinistrosFeatures
            ];
            
            return allFeatures.length > 0 ? {
              type: "FeatureCollection",
              features: allFeatures
            } : null;
          })()}
        layersConf={[
          ...(layersConf || []),
          // PDC layers - double lines that embrace infrastructure (apenas se não houver erro)
          ...(!execucaoError && execucaoCicloviaria?.features ? [
            // PDC Realizado Designado - double purple lines
            {
              id: 'pdc-realizado-designado-left',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_realizado_designado'],
              paint: {
                'line-color': '#8B5CF6',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-offset': -4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'pdc-realizado-designado-right',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_realizado_designado'],
              paint: {
                'line-color': '#8B5CF6',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-offset': 4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            // PDC Realizado Não Designado - double dashed purple lines
            {
              id: 'pdc-realizado-nao-designado-left',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_realizado_nao_designado'],
              paint: {
                'line-color': '#8B5CF6',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [4, 2],
                'line-offset': -4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'pdc-realizado-nao-designado-right',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_realizado_nao_designado'],
              paint: {
                'line-color': '#8B5CF6',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [4, 2],
                'line-offset': 4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            // Realizado Fora PDC - double orange lines
            {
              id: 'realizado-fora-pdc-left',
              type: 'line',
              filter: ['==', ['get', 'status'], 'realizado_fora_pdc'],
              paint: {
                'line-color': '#F59E0B',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [2, 2],
                'line-offset': -4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'realizado-fora-pdc-right',
              type: 'line',
              filter: ['==', ['get', 'status'], 'realizado_fora_pdc'],
              paint: {
                'line-color': '#F59E0B',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [2, 2],
                'line-offset': 4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            // PDC Não Realizado - double pink lines
            {
              id: 'pdc-nao-realizado-left',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_nao_realizado'],
              paint: {
                'line-color': '#EC4899',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [1, 3],
                'line-offset': -4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'pdc-nao-realizado-right',
              type: 'line',
              filter: ['==', ['get', 'status'], 'pdc_nao_realizado'],
              paint: {
                'line-color': '#EC4899',
                'line-width': 2,
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pulse'],
                  0, 0.3,
                  100, 1.0
                ],
                'line-dasharray': [1, 3],
                'line-offset': 4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            }
          ] : []),

          ...(!infraError && infraCicloviaria?.features ? [
            {
              id: 'infra-ciclovia',
              type: 'line',
              filter: ['==', ['get', 'infra_type'], 'Ciclovia'],
              paint: {
                'line-color': '#EF4444',
                'line-width': 4,
                'line-opacity': 0.8
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'infra-ciclofaixa',
              type: 'line',
              filter: ['==', ['get', 'infra_type'], 'Ciclofaixa'],
              paint: {
                'line-color': '#6B7280',
                'line-width': 3,
                'line-opacity': 0.8
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'infra-ciclorrota',
              type: 'line',
              filter: ['==', ['get', 'infra_type'], 'Ciclorrota'],
              paint: {
                'line-color': '#9CA3AF',
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  10, 2,
                  16, 6,
                  20, 12
                ],
                'line-opacity': 0.8
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'infra-ciclorrota-stripes',
              type: 'symbol',
              filter: ['==', ['get', 'infra_type'], 'Ciclorrota'],
              paint: {
                'text-color': '#EF4444',
                'text-opacity': 0.8
              },
              layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 20,
                'text-field': '█',
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  10, 2,
                  16, 4,
                  20, 8
                ],
                'text-rotation-alignment': 'map',
                'text-pitch-alignment': 'viewport',
                'text-offset': [0, 0]
              }
            },
            {
              id: 'infra-calcada',
              type: 'line',
              filter: ['==', ['get', 'infra_type'], 'Calçada compartilhada'],
              paint: {
                'line-color': '#10B981',
                'line-width': 3,
                'line-opacity': 0.8
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            }
          ] : []),

          // Sinistros - Vias Perigosas (apenas se não houver erro)
          ...(!sinistrosError && sinistrosData?.features ? [
            {
              id: 'vias-perigosas-high',
              type: 'line',
              filter: ['==', ['get', 'severity'], 'high'],
              paint: {
                'line-color': '#DC2626',
                'line-width': 6,
                'line-opacity': 0.9
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'vias-perigosas-medium',
              type: 'line',
              filter: ['==', ['get', 'severity'], 'medium'],
              paint: {
                'line-color': '#F59E0B',
                'line-width': 5,
                'line-opacity': 0.8
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            },
            {
              id: 'vias-perigosas-low',
              type: 'line',
              filter: ['==', ['get', 'severity'], 'low'],
              paint: {
                'line-color': '#FBBF24',
                'line-width': 4,
                'line-opacity': 0.7
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            }
          ] : [])
        ]}
        pointsData={[
          // Pontos fixos de contagem
          {
            key: 'contagem-palmares-trezedeaio',
            latitude: -8.05263,
            longitude: -34.88374,
            type: 'Contagem',
            popup: {
              name: 'R. dos Palmares x R. Treze de Maio',
              total: 1247,
              date: 'Dez/2024',
              city: 'Recife',
              created_at: '2024-12-15',
              latitude: -8.05263,
              longitude: -34.88374
            },
            customIcon: <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-white font-bold text-[6px]">●</span>
            </div>
          },
          {
            key: 'contagem-cruzcabuga-drjayme',
            latitude: -8.02016,
            longitude: -34.85586,
            type: 'Contagem',
            popup: {
              name: 'Av. Cruz Cabugá x R. Dr. Jayme',
              total: 892,
              date: 'Dez/2024',
              city: 'Recife',
              created_at: '2024-12-15',
              latitude: -8.02016,
              longitude: -34.85586
            },
            customIcon: <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-white font-bold text-[6px]">●</span>
            </div>
          },

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
        initialViewState={mapViewState}
        onViewStateChange={handleMapViewChange}
        showDefaultZoomButton={false}
        controlsSize="mini"
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
      

      <ApiStatusIndicator errors={dataErrors} onReload={handleReloadAllData} />
    </div>
  );
}