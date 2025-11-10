import { useEffect, useState } from 'react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator, useNavigate } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat') || '-8.0476';
  const lon = url.searchParams.get('lon') || '-34.8770';
  
  console.log('🔄 Loader executado com coordenadas:', { lat, lon });
  
  let contagemData = null;
  let execucaoCicloviaria = null;
  
  // Fetch contagem data with error handling
  try {
    const contagemResponse = await fetch(
      `http://192.168.10.114:3002/v1/locations/nearby?lat=${lat}&lon=${lon}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (contagemResponse.ok) {
      contagemData = await contagemResponse.json();
      console.log('📊 Dados de contagem carregados:', contagemData?.features?.length || 0, 'pontos');
    }
  } catch (error) {
    console.warn('Contagem API unavailable:', error);
  }
  
  // Fetch PDC data with error handling
  try {
    const pdcResponse = await fetch(
      `http://192.168.10.114:3020/v1/ways/all-ways?precision=4&simplify=0.0001&city=2611606&minimal=true&only_all=true`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (pdcResponse.ok) {
      execucaoCicloviaria = await pdcResponse.json();
    }
  } catch (error) {
    console.warn('PDC API unavailable:', error);
  }
  
  return json({ contagemData, execucaoCicloviaria });
}
import {
  CicloDadosHeader,
  LeftSidebar,
  RightSidebar,
  MapView,
  MuralView,
  FloatingChat,
  useCicloDadosData,
  useCicloDadosState,
  usePontosContagem,
  useExecucaoCicloviaria,
  useSinistros,
  generateInfraData,
  generatePdcData,
  generateContagemData,
  getContagemIcon,
  generateLayersConf
} from '~/components/CicloDados';
import type { StreetMatch, StreetDataSummary } from '~/services/streets.service';
import { getStreetDetails, getStreetDataSummary } from '~/services/streets.service';

export default function CicloDados() {
  const { contagemData, execucaoCicloviaria } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  console.log('Component execucaoCicloviaria:', execucaoCicloviaria ? 'loaded' : 'null', execucaoCicloviaria?.features?.length || 0);
  
  const {
    infraOptions,
    contagemOptions,
    pdcOptions,
    infracaoOptions,
    sinistroOptions,
    estacionamentoOptions
  } = useCicloDadosData();

  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    chatOpen,
    setChatOpen,
    selectedInfra,
    toggleInfraOption,
    selectedContagem,
    toggleContagemOption,
    selectedPdc,
    togglePdcOption,
    selectedInfracao,
    toggleInfracaoOption,
    selectedSinistro,
    toggleSinistroOption,
    selectedEstacionamento,
    toggleEstacionamentoOption,
    selectedGenero,
    setSelectedGenero,
    selectedRaca,
    setSelectedRaca,
    selectedSocio,
    setSelectedSocio,
    selectedDias,
    setSelectedDias,
    viewMode,
    setViewMode,
    clearAllSelections,
    selectAllOptions
  } = useCicloDadosState(
    infraOptions,
    contagemOptions,
    pdcOptions,
    infracaoOptions,
    sinistroOptions,
    estacionamentoOptions
  );
  
  // Map selection state
  const [mapSelection, setMapSelection] = useState<{lat: number, lng: number, radius: number, street?: string} | null>(null);
  
  const handleMapSelection = (coords: {lat: number, lng: number, radius: number, street?: string}) => {
    console.log('🎯 Seleção do mapa:', coords);
    console.log('🎯 Estado anterior mapSelection:', mapSelection);
    setMapSelection(coords);
    console.log('🎯 Novo mapSelection definido');
  };

  const handlePointClick = (point: any) => {
    console.log('🎯 Clique no ponto completo:', point);
    
    // Extrair coordenadas e dados do ponto clicado
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
    
    console.log('🎯 Coordenadas encontradas:', { lat, lng, name, totalCyclists });
    
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
    console.log('🎯 Chamando handleMapSelection com:', coords);
    handleMapSelection(coords);
  };

  const [mapViewState, setMapViewState] = useState({
    latitude: -8.0476,
    longitude: -34.8770,
    zoom: 11
  });
  const [selectedStreetGeometry, setSelectedStreetGeometry] = useState<any>(null);
  const [selectedStreetData, setSelectedStreetData] = useState<StreetDataSummary | null>(null);

  const handleZoomToStreet = async (bounds: {north: number, south: number, east: number, west: number}, streetGeometry?: any, streetId?: string) => {
    console.log('handleZoomToStreet chamado com bounds:', bounds);
    
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 17;
    if (maxDiff > 0.01) zoom = 14;
    else if (maxDiff > 0.005) zoom = 15;
    else if (maxDiff > 0.002) zoom = 16;
    
    const newViewState = {
      latitude: centerLat,
      longitude: centerLng,
      zoom: zoom
    };
    
    console.log('Novo viewState:', newViewState);
    console.log('ViewState atual:', mapViewState);
    
    setMapViewState(newViewState);
    
    // Salvar geometria da via para destacar
    if (streetGeometry) {
      setSelectedStreetGeometry({
        type: "FeatureCollection",
        features: streetGeometry.features.map((feature: any) => ({
          ...feature,
          properties: { ...feature.properties, highlighted: true }
        }))
      });
    }
    
    // Buscar dados da via
    if (streetId) {
      try {
        const streetData = await getStreetDataSummary(streetId);
        setSelectedStreetData(streetData);
      } catch (error) {
        console.error('Erro ao buscar dados da via:', error);
      }
    }
    

  };

  // Gerar dados do mapa
  const infraData = generateInfraData(selectedInfra);
  const pdcData = generatePdcData(selectedPdc, execucaoCicloviaria);
  const contagemMapData = generateContagemData(selectedContagem, contagemData);
  const layersConf = generateLayersConf(selectedInfra, selectedPdc, infraOptions, pdcOptions);
  


  // Auto-abrir sidebars após 3 segundos quando em modo mapa
  useEffect(() => {
    if (viewMode === 'map') {
      const timer = setTimeout(() => {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, setLeftSidebarOpen, setRightSidebarOpen]);
  
  // Reload functions
  const handleReloadMapData = () => {
    // Revalidate loader data (contagem data)
    revalidator.revalidate();
    
    // Clear current map selection to force refresh
    setMapSelection(null);
    
    // Optionally show a toast or feedback
    console.log('Recarregando dados do mapa...');
  };
  
  const handleReloadGeneralData = () => {
    // Reset to default selections instead of clearing all
    selectAllOptions();
    
    // Revalidate loader data
    revalidator.revalidate();
    
    // Optionally show a toast or feedback
    console.log('Recarregando informações gerais...');
  };
  
  // Demo event listener
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

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden" style={{height: '100vh', maxHeight: '100vh', maxWidth: '100vw'}}>
      <CicloDadosHeader 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        onZoomToStreet={handleZoomToStreet}
      />

      <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 64px)'}}>
        {viewMode === 'map' && (
          <LeftSidebar
            isOpen={leftSidebarOpen}
            onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
            infraOptions={infraOptions}
            selectedInfra={selectedInfra}
            onInfraToggle={toggleInfraOption}
            contagemOptions={contagemOptions}
            selectedContagem={selectedContagem}
            onContagemToggle={toggleContagemOption}
            pdcOptions={pdcOptions}
            selectedPdc={selectedPdc}
            onPdcToggle={togglePdcOption}
            infracaoOptions={infracaoOptions}
            selectedInfracao={selectedInfracao}
            onInfracaoToggle={toggleInfracaoOption}
            sinistroOptions={sinistroOptions}
            selectedSinistro={selectedSinistro}
            onSinistroToggle={toggleSinistroOption}
            estacionamentoOptions={estacionamentoOptions}
            selectedEstacionamento={selectedEstacionamento}
            onEstacionamentoToggle={toggleEstacionamentoOption}
            selectedGenero={selectedGenero}
            onGeneroChange={setSelectedGenero}
            selectedRaca={selectedRaca}
            onRacaChange={setSelectedRaca}
            selectedSocio={selectedSocio}
            onSocioChange={setSelectedSocio}
            selectedDias={selectedDias}
            onDiasChange={setSelectedDias}
            onClearAll={clearAllSelections}
            onSelectAll={selectAllOptions}
            onReloadMapData={handleReloadMapData}
            onReloadGeneralData={handleReloadGeneralData}
          />
        )}

        <main className="flex-1 relative">
          {viewMode === 'map' ? (
            <MapView
              selectedInfra={selectedInfra}
              selectedPdc={selectedPdc}
              selectedContagem={selectedContagem}
              selectedEstacionamento={selectedEstacionamento}
              selectedSinistro={selectedSinistro}
              infraOptions={infraOptions}
              pdcOptions={pdcOptions}
              layersConf={layersConf}
              infraData={infraData}
              pdcData={pdcData}
              contagemData={contagemMapData}
              getContagemIcon={getContagemIcon}
              externalViewState={mapViewState}
              highlightedStreet={selectedStreetGeometry}
              streetData={selectedStreetData}
              onPointClick={handlePointClick}
            />
          ) : (
            <MuralView 
              sidebarOpen={leftSidebarOpen}
              onSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
            />
          )}
        </main>

        <RightSidebar
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          viewMode={viewMode}
          mapSelection={mapSelection}
        />
        

      </div>

      <FloatingChat
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}