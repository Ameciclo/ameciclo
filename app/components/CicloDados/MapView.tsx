import { useState, useEffect, useRef, useMemo } from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";

import { MapPin, Bike, UserCheck } from 'lucide-react';
import { createClusters } from './utils/clustering';
import { useBicicletarios } from './hooks/useBicicletarios';
import { useBikePE } from './hooks/useBikePE';
import { useInfraCicloviaria } from './hooks/useInfraCicloviaria';
import { usePontosContagem } from './hooks/usePontosContagem';
import { useExecucaoCicloviaria } from './hooks/useExecucaoCicloviaria';
import { useSinistros } from './hooks/useSinistros';
import { usePerfilPoints } from './hooks/usePerfilPoints';
import { usePerfilCiclistas } from './hooks/usePerfilCiclistas';
import { DataErrorAlert } from './DataErrorAlert';
import { ApiStatusIndicator } from './ApiStatusIndicator';
import { PointInfoPopup } from './PointInfoPopup';



interface MapViewProps {
  selectedInfra: string[];
  selectedPdc: string[];
  selectedContagem: string[];
  selectedEstacionamento: string[];
  selectedSinistro: string[];
  selectedPerfil: string[];
  selectedGenero: string;
  selectedRaca: string;
  selectedSocio: string;
  selectedDias: string;
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
  selectedStreetFilter?: string | null;
  perfilCiclistasData?: any;
  autoOpenPopup?: {lat: number, lng: number} | null;
  onPopupOpened?: () => void;
}

export function MapView({
  selectedInfra,
  selectedPdc,
  selectedContagem,
  selectedEstacionamento,
  selectedSinistro,
  selectedPerfil,
  selectedGenero,
  selectedRaca,
  selectedSocio,
  selectedDias,
  layersConf,
  infraData,
  pdcData,
  contagemData,
  getContagemIcon,
  pdcOptions,
  onPointClick,
  externalViewState,
  highlightedStreet,
  streetData,
  selectedStreetFilter,
  perfilCiclistasData,
  autoOpenPopup,
  onPopupOpened
}: Omit<MapViewProps, 'bicicletarios'> & { pdcOptions: Array<{ name: string; apiKey: string }>; perfilCiclistasData?: any }) {

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showPointInfo, setShowPointInfo] = useState<{ lat: number; lng: number; initialTab?: string } | null>(null);
  const [dragPanEnabled, setDragPanEnabled] = useState(true);
  const [clusterTooltip, setClusterTooltip] = useState<{ show: boolean; count: number; x: number; y: number }>({ show: false, count: 0, x: 0, y: 0 });
  const [mapViewState, setMapViewState] = useState({ latitude: -8.0476, longitude: -34.8770, zoom: 11 });

  const [forceRender, setForceRender] = useState(0);
  const [renderedLayers, setRenderedLayers] = useState<Set<string>>(new Set());
  const [loadingLayers, setLoadingLayers] = useState<Set<string>>(new Set());

  // Atualizar com estado externo quando fornecido
  useEffect(() => {
    if (externalViewState) {
      setMapViewState(externalViewState);
      setForceRender(Date.now());
    }
  }, [externalViewState]);

  // Auto-open popup from URL
  useEffect(() => {
    if (autoOpenPopup && !showPointInfo) {
      setShowPointInfo({ lat: autoOpenPopup.lat, lng: autoOpenPopup.lng });
      setSelectedPoints([{ lat: autoOpenPopup.lat, lng: autoOpenPopup.lng, id: 'url-point' }]);
      onPopupOpened?.();
    }
  }, [autoOpenPopup, showPointInfo, onPopupOpened]);

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
    
    // Load saved map position after hydration
    const saved = localStorage.getItem('ciclodados-map-view');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMapViewState(parsed);
      } catch (e) {
        // Erro silencioso
      }
    }
  }, []);
  
  // Usar hooks com bounds para filtrar dados apenas no cliente
  const { data: filteredBicicletarios, error: bicicletariosError } = useBicicletarios(isClient ? viewportBounds : undefined);
  const { data: filteredBikePE, error: bikePEError } = useBikePE(isClient ? viewportBounds : undefined);
  const { data: infraCicloviaria, error: infraError } = useInfraCicloviaria(isClient ? viewportBounds : undefined, selectedInfra);
  const { data: pontosContagem, error: pontosContagemError } = usePontosContagem(); // Sem filtro de bounds
  const { data: execucaoCicloviaria, error: execucaoError } = useExecucaoCicloviaria(isClient ? viewportBounds : undefined);
  const { data: sinistrosData, error: sinistrosError } = useSinistros(isClient ? viewportBounds : undefined);
  const { data: perfilPoints, error: perfilError } = usePerfilPoints(
    isClient ? viewportBounds : undefined,
    {
      genero: selectedGenero,
      raca: selectedRaca, 
      socio: selectedSocio,
      dias: selectedDias
    }
  );
  // Use data from props instead of hook to avoid CORS
  const perfilCiclistas = perfilCiclistasData;
  const perfilCiclistasError = null;
  const perfilCiclistasLoading = false;
  
  // Debug perfil ciclistas
  useEffect(() => {
    if (perfilCiclistas) {
      console.log('🔍 Perfil Ciclistas carregado:', perfilCiclistas.features?.length, 'pontos');
    }
  }, [perfilCiclistas]);

  // Track loading state based on data availability
  useEffect(() => {
    const newLoadingLayers = new Set<string>();
    const newRenderedLayers = new Set<string>();

    // Infrastructure loading/rendered state
    if (selectedInfra.length > 0) {
      if (infraError) {
        // If there's an error, consider it "rendered" (failed)
        newRenderedLayers.add('infraestrutura');
      } else if (infraCicloviaria?.features?.length > 0) {
        // Data loaded successfully
        newRenderedLayers.add('infraestrutura');
      } else {
        // Still loading
        newLoadingLayers.add('infraestrutura');
      }
    }

    // PDC loading/rendered state
    if (selectedPdc.length > 0) {
      if (execucaoError) {
        // If there's an error, consider it "rendered" (failed)
        newRenderedLayers.add('pdc');
      } else if (execucaoCicloviaria?.features?.length > 0) {
        // Data loaded successfully
        newRenderedLayers.add('pdc');
      } else {
        // Still loading
        newLoadingLayers.add('pdc');
      }
    }

    // Estacionamento loading/rendered state
    if (selectedEstacionamento.length > 0) {
      const hasBicicletarios = filteredBicicletarios?.features?.length > 0;
      const hasBikePE = filteredBikePE?.features?.length > 0;
      const hasEstacionamentoError = bicicletariosError || bikePEError;
      
      if (hasEstacionamentoError) {
        newRenderedLayers.add('estacionamento');
      } else if (hasBicicletarios || hasBikePE) {
        newRenderedLayers.add('estacionamento');
      } else {
        newLoadingLayers.add('estacionamento');
      }
    }

    // Contagem loading/rendered state
    if (selectedContagem.length > 0) {
      const hasContagemData = (contagemData?.features?.length > 0) || (pontosContagem?.features?.length > 0);
      const hasContagemError = pontosContagemError;
      
      if (hasContagemError) {
        newRenderedLayers.add('contagem');
      } else if (hasContagemData) {
        newRenderedLayers.add('contagem');
      } else {
        newLoadingLayers.add('contagem');
      }
    }

    // Perfil loading/rendered state
    if (selectedPerfil.length > 0) {
      if (perfilCiclistasError) {
        newRenderedLayers.add('perfil');
      } else if (perfilCiclistas?.features?.length > 0) {
        newRenderedLayers.add('perfil');
      } else if (perfilCiclistasLoading) {
        newLoadingLayers.add('perfil');
      }
    }

    setLoadingLayers(newLoadingLayers);
    setRenderedLayers(newRenderedLayers);
  }, [
    selectedInfra, selectedPdc, selectedEstacionamento, selectedContagem, selectedPerfil,
    infraCicloviaria, execucaoCicloviaria, filteredBicicletarios, filteredBikePE, pontosContagem, contagemData, perfilCiclistas,
    infraError, execucaoError, bicicletariosError, bikePEError, pontosContagemError, perfilCiclistasError, perfilCiclistasLoading
  ]);
  

  
  // Coletar erros para exibir avisos
  const dataErrors = [];
  if (bicicletariosError) dataErrors.push({ type: 'bicicletarios', message: bicicletariosError });
  if (bikePEError) dataErrors.push({ type: 'bikepe', message: bikePEError });
  if (infraError) dataErrors.push({ type: 'infraestrutura', message: infraError });
  if (pontosContagemError) dataErrors.push({ type: 'pontos-contagem', message: pontosContagemError });
  if (execucaoError) dataErrors.push({ type: 'execucao-cicloviaria', message: execucaoError });
  if (sinistrosError) dataErrors.push({ type: 'sinistros', message: sinistrosError });
  if (perfilError) dataErrors.push({ type: 'perfil', message: perfilError });
  if (perfilCiclistasError) dataErrors.push({ type: 'perfil-ciclistas', message: perfilCiclistasError });

  const handleMapViewChange = (viewState: any) => {
    setMapViewState(viewState);
    
    // Debounce para evitar muitas escritas no localStorage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (isClient) {
        const dataToSave = {
          latitude: viewState.latitude,
          longitude: viewState.longitude,
          zoom: viewState.zoom
        };
        localStorage.setItem('ciclodados-map-view', JSON.stringify(dataToSave));
      }
    }, 500);
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
    setShowPointInfo({ lat, lng });
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('lat', lat.toFixed(6));
    url.searchParams.set('lon', lng.toFixed(6));
    url.searchParams.set('zoom', mapViewState.zoom.toString());
    window.history.pushState({}, '', url.toString());
    
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
      setShowPointInfo(null);
    }
  };
  
  const toggleDragPan = () => {
    console.log('toggleDragPan called, current dragPanEnabled:', dragPanEnabled, 'current isSelectionMode:', isSelectionMode);
    const newDragPanEnabled = !dragPanEnabled;
    setDragPanEnabled(newDragPanEnabled);
    
    if (newDragPanEnabled) {
      // Ao ativar drag pan, desabilitar modo de seleção
      console.log('Disabling selection mode');
      setIsSelectionMode(false);
      setHoverPoint(null);
      setSelectedPoints([]);
      setShowPointInfo(null);
    }
  };
  
  const handleReloadAllData = () => {
    window.location.reload();
  };

  // Função para lidar com clique em cluster - zoom in na coordenada do cluster
  const handleClusterClick = (item: any) => {
    const newViewState = {
      latitude: item.geometry.coordinates[1],
      longitude: item.geometry.coordinates[0],
      zoom: Math.min(mapViewState.zoom + 1, 20)
    };
    setMapViewState(newViewState);
    handleMapViewChange(newViewState);
  };

  return (
    <div style={{height: 'calc(100vh - 64px)'}} className="relative flex flex-col">
      {/* Botão no canto superior esquerdo */}
      <div className="absolute top-4 left-4 z-[60] flex flex-col gap-2">
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
          onPointClick={(point) => {
          // Bicicletários e Bike PE mantêm popup antigo, outros usam popup completo
          if (point.type === 'bicicletario' || point.type === 'bikepe') {
            return; // Deixa o popup padrão do mapa funcionar
          }
          
          // Não processar cliques em clusters - eles têm seu próprio onClick
          if (point.isCluster) {
            return;
          }
          
          // Determinar a aba baseada no tipo do ponto
          let initialTab = 'overview';
          if (point.type === 'perfil') initialTab = 'profile';
          else if (point.type === 'Contagem') initialTab = 'counts';

          setShowPointInfo({ 
            lat: point.latitude, 
            lng: point.longitude, 
            initialTab 
          });
          
          // Update URL
          const url = new URL(window.location.href);
          url.searchParams.set('lat', point.latitude.toFixed(6));
          url.searchParams.set('lon', point.longitude.toFixed(6));
          url.searchParams.set('zoom', mapViewState.zoom.toString());
          window.history.pushState({}, '', url.toString());
        }}
          layerData={(() => {
            // Quando há filtro de rua selecionada, mostrar todos os dados (não filtrar por área)
            const filterByStreetArea = (features: any[]) => {
              // Se não há filtro de rua ou não há features, retornar como está
              if (!selectedStreetFilter || !features) return features;
              
              // Quando há filtro de rua, retornar todas as features para mostrar no mapa
              return features;
            };
            
            // Filtrar infraestrutura por tipos selecionados e área
            let filteredInfraFeatures = infraCicloviaria?.features?.filter((feature: any) => 
              selectedInfra.includes(feature.properties.infra_type)
            ) || [];
            filteredInfraFeatures = filterByStreetArea(filteredInfraFeatures);
            
            // Filtrar execução cicloviária por status selecionados e área
            const selectedPdcApiKeys = selectedPdc.map(name => {
              const option = pdcOptions.find(opt => opt.name === name);
              return option?.apiKey;
            }).filter(Boolean);
            
            let filteredExecucaoFeatures = (!execucaoError && execucaoCicloviaria?.features) ? 
              execucaoCicloviaria.features.filter((feature: any) => 
                selectedPdcApiKeys.includes(feature.properties.status)
              ) : [];
            filteredExecucaoFeatures = filterByStreetArea(filteredExecucaoFeatures);
            
            // Filtrar sinistros por tipos selecionados e área
            let filteredSinistrosFeatures = sinistrosData?.features?.filter((feature: any) => 
              selectedSinistro.includes(feature.properties.type)
            ) || [];
            filteredSinistrosFeatures = filterByStreetArea(filteredSinistrosFeatures);
            
            // Aplicar filtro de área aos dados gerados
            let infraDataFiltered = filterByStreetArea(infraData?.features || []);
            let pdcDataFiltered = filterByStreetArea(pdcData?.features || []);
            
            const allFeatures = [
              ...infraDataFiltered,
              ...pdcDataFiltered,
              ...(highlightedStreet?.features || []),
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
          // Só mostrar se não há filtro de rua ou se há dados na área
          ...(!execucaoError && execucaoCicloviaria?.features && selectedPdc.length > 0 ? [
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
            // PDC Não Realizado - double pink dotted lines
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
                'line-dasharray': [0.1, 3],
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
                'line-dasharray': [0.1, 3],
                'line-offset': 4
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              }
            }
          ] : []),

          ...(!infraError && infraCicloviaria?.features && selectedInfra.length > 0 ? [
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
          ...(!sinistrosError && sinistrosData?.features && selectedSinistro.length > 0 ? [
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
          // Pontos de contagem da prefeitura via hook direto (renderizar primeiro, ficar embaixo)
          ...(isClient && selectedContagem.includes('Contagem da Prefeitura') && pontosContagem?.features && Array.isArray(pontosContagem.features) ? 
            createClusters(
              pontosContagem.features, 
              mapViewState.zoom, 
              mapViewState
            )
              .map((item: any) => {
                const totalContagens = item.isCluster ? 
                  item.properties.items.reduce((sum: number, f: any) => sum + (f.properties.total_cyclists || f.properties.count || 0), 0) :
                  (item.properties.items?.[0]?.properties?.total_cyclists || item.properties.items?.[0]?.properties?.count || 0);
                
                const scaleSize = mapViewState.zoom < 12 ? 0.7 : mapViewState.zoom < 14 ? 0.85 : 1;
                
                return {
                  key: `prefeitura-contagem-${item.id}`,
                  latitude: item.geometry.coordinates[1],
                  longitude: item.geometry.coordinates[0],
                  type: 'Contagem',
                  isCluster: item.isCluster,
                  popup: {
                    name: item.isCluster ? `${item.properties.count} Pontos Prefeitura` : 
                          (item.properties.items?.[0]?.properties?.name || 'Ponto Prefeitura'),
                    total: totalContagens,
                    date: item.properties.items?.[0]?.properties?.last_count_date,
                    city: item.properties.items?.[0]?.properties?.city,
                    created_at: item.properties.items?.[0]?.properties?.last_count_date,
                    latitude: item.geometry.coordinates[1],
                    longitude: item.geometry.coordinates[0]
                  },
                  cargo_percent: item.properties.items?.[0]?.properties?.cargo_percent,
                  wrong_way_percent: item.properties.items?.[0]?.properties?.wrong_way_percent,
                  customIcon: (
                    <div className="relative" style={{ transform: `scale(${scaleSize})` }}>
                      <div className="bg-white text-black px-2 py-1 rounded-lg shadow-lg border-2 border-black flex items-center gap-1 min-w-[50px] justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M3 3v18h18"/>
                          <path d="M18 17V9"/>
                          <path d="M13 17V5"/>
                          <path d="M8 17v-3"/>
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold">{totalContagens}</span>
                          <span className="text-[8px] text-gray-500">
                            {item.properties.items?.[0]?.properties?.last_count_date?.split('/')[1] || new Date().getFullYear()}
                          </span>
                        </div>
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
                  onClick: () => {
                    if (item.isCluster) {
                      handleClusterClick(item);
                    } else {
                      setShowPointInfo({ 
                        lat: item.geometry.coordinates[1], 
                        lng: item.geometry.coordinates[0], 
                        initialTab: 'counts' 
                      });
                    }
                  }
                };
              }) : []),

          // Pontos de contagem via props (dados processados no loader) - renderizar por último, ficar em cima
          ...(isClient && selectedContagem.length > 0 && contagemData?.features && Array.isArray(contagemData.features) ? 
            createClusters(
              contagemData.features, 
              mapViewState.zoom, 
              mapViewState
            )
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
                  isCluster: item.isCluster,
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
                      <div className="bg-green-500 text-white px-2 py-1 rounded-lg shadow-lg border-2 border-green-700 flex items-center gap-1 min-w-[50px] justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M3 3v18h18"/>
                          <path d="M18 17V9"/>
                          <path d="M13 17V5"/>
                          <path d="M8 17v-3"/>
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold">{totalContagens}</span>
                          <span className="text-[8px] text-white">
                            {item.properties.items?.[0]?.properties?.last_count_date?.split('/')[1] || new Date().getFullYear()}
                          </span>
                        </div>
                        {item.isCluster && item.properties.count > 1 && (
                          <span 
                            className="text-[8px] bg-green-500 text-white border border-green-700 rounded-full px-1 ml-1 cursor-help relative"
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
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-green-500"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-1px]">
                          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-green-700"></div>
                        </div>
                      </div>
                    </div>
                  ),
                  onClick: () => {
                    if (item.isCluster) {
                      handleClusterClick(item);
                    } else {
                      setShowPointInfo({ 
                        lat: item.geometry.coordinates[1], 
                        lng: item.geometry.coordinates[0], 
                        initialTab: 'counts' 
                      });
                    }
                  }
                };
              }) : []),



          ...(isClient && selectedEstacionamento.includes('Bicicletários') && filteredBicicletarios?.features && Array.isArray(filteredBicicletarios.features) ? 
            createClusters(
              filteredBicicletarios.features, 
              mapViewState.zoom, 
              mapViewState
            )
              .map((item: any) => {
                const props = item.isCluster ? null : item.properties.items?.[0]?.properties;
                return {
                  key: `bicicletario-${item.id}`,
                  latitude: item.geometry.coordinates[1],
                  longitude: item.geometry.coordinates[0],
                  type: 'bicicletario',
                  isCluster: item.isCluster,
                  popup: {
                    name: item.isCluster ? `${item.properties.count} Bicicletários` : (props?.name || 'Bicicletário'),
                    total: item.isCluster ? 'Cluster' : 'Estacionamento de bicicletas',
                    capacity: props?.capacity || 'Não informada',
                    covered: props?.covered === 'yes' ? 'Sim' : props?.covered === 'no' ? 'Não' : 'Não informado',
                    access: props?.access === 'yes' ? 'Público' : props?.access === 'customers' ? 'Clientes' : props?.access === 'permissive' ? 'Permitido' : 'Não informado',
                    operator: props?.operator || 'Não informado',
                    parking_type: props?.bicycle_parking || 'Não informado'
                  },
                  customIcon: item.isCluster ? 
                    <div className="bg-blue-600 text-white rounded-lg min-w-[20px] h-[20px] px-[3px] flex flex-col items-center justify-center shadow-lg border border-white">
                      <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>∩</span>
                      <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>{item.properties.count}</span>
                    </div> :
                    <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                      <span className="text-white font-black text-[10px]" style={{textShadow: '0 0 1px white'}}>∩</span>
                    </div>,
                  onClick: () => {
                    if (item.isCluster) {
                      handleClusterClick(item);
                    } else {
                      setShowPointInfo({ 
                        lat: item.geometry.coordinates[1], 
                        lng: item.geometry.coordinates[0], 
                        initialTab: 'infrastructure' 
                      });
                    }
                  }
                };
              }) : []),
          ...(isClient && selectedEstacionamento.includes('Estações de Bike PE') && filteredBikePE?.features && Array.isArray(filteredBikePE.features) ? 
            createClusters(
              filteredBikePE.features, 
              mapViewState.zoom, 
              mapViewState
            )
              .map((item: any) => {
                const props = item.isCluster ? null : item.properties.items?.[0]?.properties;
                return {
                  key: `bikepe-${item.id}`,
                  latitude: item.geometry.coordinates[1],
                  longitude: item.geometry.coordinates[0],
                  type: 'bikepe',
                  isCluster: item.isCluster,
                  popup: {
                    name: item.isCluster ? `${item.properties.count} Estações Bike PE` : (props?.name || 'Estação Bike PE'),
                    total: item.isCluster ? 'Cluster' : 'Bicicletas compartilhadas',
                    ref: props?.ref || 'Não informada',
                    capacity: props?.capacity || 'Não informada',
                    network: props?.network || 'Não informada',
                    operator: props?.operator || 'Não informado',
                    payment_credit: props?.payment_credit_cards ? 'Aceita' : 'Não aceita',
                    fee: props?.fee ? 'Sim' : 'Não'
                  },
                  customIcon: item.isCluster ? 
                    <div className="bg-orange-500 text-white rounded-lg min-w-[20px] h-[20px] px-[3px] flex flex-col items-center justify-center shadow-lg border border-white">
                      <Bike size={8} className="text-white" />
                      <span className="text-[8px] font-black leading-none" style={{textShadow: '0 0 1px white'}}>{item.properties.count}</span>
                    </div> :
                    <div className="bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                      <Bike size={10} className="text-white" />
                    </div>,
                  onClick: () => {
                    if (item.isCluster) {
                      handleClusterClick(item);
                    } else {
                      setShowPointInfo({ 
                        lat: item.geometry.coordinates[1], 
                        lng: item.geometry.coordinates[0], 
                        initialTab: 'infrastructure' 
                      });
                    }
                  }
                };
              }) : []),

          // Pontos de Perfil de Ciclistas (Nova API)
          ...(isClient && selectedPerfil.includes('Perfil de Ciclistas') && perfilCiclistas?.features && Array.isArray(perfilCiclistas.features) ? (() => {
            // Filtrar por edição (ano) selecionada
            const filteredFeatures = selectedGenero === 'Todas' 
              ? perfilCiclistas.features 
              : perfilCiclistas.features.filter((point: any) => point.properties.survey_year === selectedGenero);
            
            console.log('🔍 Renderizando pontos de perfil:', filteredFeatures.length, 'de', perfilCiclistas.features.length, 'filtrados por:', selectedGenero);
            return filteredFeatures.map((point: any) => {
              const scaleSize = mapViewState.zoom < 12 ? 0.7 : mapViewState.zoom < 14 ? 0.85 : 1;
              
              return {
                key: `perfil-ciclistas-${point.properties.id}`,
                latitude: point.geometry.coordinates[1],
                longitude: point.geometry.coordinates[0],
                type: 'perfil',
                popup: {
                  name: point.properties.name,
                  total: `${point.properties.total_responses} respostas`,
                  survey_year: point.properties.survey_year,
                  area: point.properties.area,
                  avg_age: point.properties.avg_age,
                  male_percentage: point.properties.male_percentage,
                  female_percentage: point.properties.female_percentage,
                  accidents_percentage: point.properties.accidents_percentage,
                  top_motivation: point.properties.top_motivation,
                  latitude: point.geometry.coordinates[1],
                  longitude: point.geometry.coordinates[0]
                },
                customIcon: (
                  <div className="relative" style={{ transform: `scale(${scaleSize})` }}>
                    <div className="bg-purple-500 text-white px-2 py-1 rounded-lg shadow-lg border-2 border-purple-700 flex items-center gap-1 min-w-[50px] justify-center">
                      <UserCheck size={12} className="text-white" />
                      <span className="text-xs font-bold">{point.properties.total_responses}</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-purple-500"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-1px]">
                        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-purple-700"></div>
                      </div>
                    </div>
                  </div>
                ),
                onClick: () => {
                  const lat = point.geometry.coordinates[1];
                  const lng = point.geometry.coordinates[0];
                  setShowPointInfo({ lat, lng, initialTab: 'profile' });
                  
                  // Update URL
                  const url = new URL(window.location.href);
                  url.searchParams.set('lat', lat.toFixed(6));
                  url.searchParams.set('lon', lng.toFixed(6));
                  url.searchParams.set('zoom', mapViewState.zoom.toString());
                  window.history.pushState({}, '', url.toString());
                }
              };
            });
          })() : []),


          
        
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
      

      
      <ApiStatusIndicator errors={dataErrors} onReload={handleReloadAllData} />
      
      {/* Loading discreto no canto inferior esquerdo */}
      {(() => {
        const loadingLayerNames = [];
        if (loadingLayers.has('infraestrutura')) loadingLayerNames.push('Infraestrutura');
        if (loadingLayers.has('pdc')) loadingLayerNames.push('Plano Diretor');
        if (loadingLayers.has('estacionamento')) loadingLayerNames.push('Estacionamentos');
        if (loadingLayers.has('contagem')) loadingLayerNames.push('Contagem');
        if (loadingLayers.has('perfil')) loadingLayerNames.push('Perfil de Ciclistas');
        
        return loadingLayerNames.length > 0 ? (
          <div className="absolute bottom-4 left-4 z-[60] bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando {loadingLayerNames.join(', ')}...</span>
          </div>
        ) : null;
      })()}
      
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
      
      {/* Point Info Popup */}
      {showPointInfo && (
        <PointInfoPopup
          lat={showPointInfo.lat}
          lng={showPointInfo.lng}
          initialTab={showPointInfo.initialTab}
          onClose={() => {
            setShowPointInfo(null);
            // Keep the point visible when closing popup from URL
            if (autoOpenPopup) {
              setSelectedPoints([{ lat: autoOpenPopup.lat, lng: autoOpenPopup.lng, id: 'url-point' }]);
            }
          }}
        />
      )}
    </div>
  );
}