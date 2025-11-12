import { useEffect, useState } from 'react';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useRevalidator, useNavigate } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: "CicloDados - Dados de Ciclismo Urbano" },
    { name: "description", content: "Visualização de dados de ciclismo urbano, contagens, infraestrutura e perfil de ciclistas" },
  ];
};
import { CicloDadosErrorBoundary } from '~/components/CicloDados/ErrorBoundary';
import { ClientOnly, CicloDadosLoader } from '~/components/CicloDados/ClientOnly';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat') || '-8.0476';
  const lon = url.searchParams.get('lon') || '-34.8770';
  
  try {
    // Fetch Ameciclo data and cyclist profile data
    const [amecicloResponse, perfilResponse] = await Promise.all([
      fetch('https://cyclist-counts.atlas.ameciclo.org/v1/locations'),
      fetch('https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/survey-locations')
    ]);
    
    const amecicloData = amecicloResponse.ok ? await amecicloResponse.json() : [];
    const perfilData = perfilResponse.ok ? await perfilResponse.json() : null;
    
    return json({ 
      contagemData: {
        ameciclo: amecicloData,
        prefeitura: [] // Prefeitura data loaded via hook from static file
      }, 
      execucaoCicloviaria: null,
      perfilCiclistas: perfilData
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return json({ 
      contagemData: {
        ameciclo: [],
        prefeitura: []
      }, 
      execucaoCicloviaria: null,
      perfilCiclistas: null
    });
  }
}
import {
  CicloDadosHeader,
  LeftSidebar,
  RightSidebar,
  MapView,
  MuralView,
  // FloatingChat,
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
  const { contagemData, execucaoCicloviaria, perfilCiclistas } = useLoaderData<typeof loader>();
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
  
  const perfilOptions = ['Perfil de Ciclistas'];

  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    chatOpen,
    setChatOpen,
    selectedInfra,
    toggleInfraOption,
    toggleAllInfraOptions,
    selectedContagem,
    toggleContagemOption,
    toggleAllContagemOptions,
    selectedPdc,
    togglePdcOption,
    toggleAllPdcOptions,
    selectedInfracao,
    toggleInfracaoOption,
    toggleAllInfracaoOptions,
    selectedSinistro,
    toggleSinistroOption,
    toggleAllSinistroOptions,
    selectedEstacionamento,
    toggleEstacionamentoOption,
    toggleAllEstacionamentoOptions,
    selectedPerfil,
    togglePerfilOption,
    toggleAllPerfilOptions,
    selectedGenero,
    setSelectedGenero,
    selectedAno,
    setSelectedAno,
    selectedArea,
    setSelectedArea,
    selectedIdade,
    setSelectedIdade,
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
    estacionamentoOptions,
    perfilOptions
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
  const [selectedStreetFilter, setSelectedStreetFilter] = useState<string | null>(null);

  const handleZoomToStreet = async (bounds: {north: number, south: number, east: number, west: number}, streetGeometry?: any, streetId?: string, streetName?: string) => {
    console.log('handleZoomToStreet chamado com bounds:', bounds);
    
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15; // Zoom mais próximo para destacar a rua
    if (maxDiff > 0.01) zoom = 13;
    else if (maxDiff > 0.005) zoom = 14;
    else if (maxDiff > 0.002) zoom = 15;
    
    const newViewState = {
      latitude: centerLat,
      longitude: centerLng,
      zoom: zoom
    };
    
    console.log('Novo viewState:', newViewState);
    setMapViewState(newViewState);
    
    // Se streetName está vazio, limpar seleção
    if (!streetName) {
      setMapSelection(null);
      setSelectedStreetGeometry(null);
      setSelectedStreetFilter(null);
    } else {
      // Criar ponto de seleção no centro da rua
      const streetPin = {
        lat: centerLat,
        lng: centerLng,
        radius: 500,
        street: streetName
      };
      
      setMapSelection(streetPin);
      setSelectedStreetGeometry(null);
      setSelectedStreetFilter(streetName);
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

  // Convert perfilCiclistas to GeoJSON format
  const processedPerfilData = perfilCiclistas?.locations ? {
    type: 'FeatureCollection',
    features: perfilCiclistas.locations.map((location: any, index: number) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.coordinates.lon, location.coordinates.lat]
      },
      properties: {
        id: `profile_${index}`,
        name: location.location_info.street,
        neighborhood: location.location_info.neighborhood,
        area: location.location_info.area,
        survey_year: location.location_info.survey_year,
        total_responses: parseInt(location.statistics.total_responses),
        avg_age: location.statistics.avg_age,
        male_percentage: location.statistics.gender_distribution.male_percentage,
        female_percentage: location.statistics.gender_distribution.female_percentage,
        accidents_percentage: location.statistics.accidents_percentage,
        top_motivation: location.statistics.top_motivation,
        type: 'perfil'
      }
    }))
  } : null;

  // Convert contagemData to GeoJSON format
  const processedContagemData = contagemData ? {
    type: 'FeatureCollection',
    features: [
      // Ameciclo data
      ...(contagemData.ameciclo || []).map((ponto: any) => {
        const lat = parseFloat(ponto.latitude);
        const lng = parseFloat(ponto.longitude);
        const latestCount = ponto.counts?.[0];
        const totalCyclists = latestCount?.total_cyclists || 0;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: `ameciclo_${ponto.id}`,
            name: ponto.name,
            city: ponto.city,
            count: totalCyclists,
            total_cyclists: totalCyclists,
            type: 'Contagem',
            source: 'ameciclo',
            last_count_date: (() => {
              const date = latestCount?.date || latestCount?.created_at || ponto.created_at;
              return date ? new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado';
            })(),
            mulheres: latestCount?.women || latestCount?.mulheres || 0,
            carona: latestCount?.passengers || latestCount?.carona || 0,
            servico: latestCount?.service || latestCount?.servico || 0,
            cargueira: latestCount?.cargo || latestCount?.cargueira || 0,
            contramao: latestCount?.wrong_way || latestCount?.contramao || 0,
            calcada: latestCount?.sidewalk || latestCount?.calcada || 0,
            criancas: latestCount?.children || latestCount?.criancas || 0,
            capacete: latestCount?.helmet || latestCount?.capacete || 0
          }
        };
      }),
      // Prefeitura data
      ...(contagemData.prefeitura || []).map((ponto: any, index: number) => {
        const lat = parseFloat(ponto.coordinates?.latitude || 0);
        const lng = parseFloat(ponto.coordinates?.longitude || 0);
        const totalCyclists = ponto.total_cyclists || 0;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: `prefeitura_${index}`,
            name: ponto.name || `Ponto ${index + 1}`,
            city: 'Recife',
            count: totalCyclists,
            total_cyclists: totalCyclists,
            type: 'Contagem',
            source: 'prefeitura',
            last_count_date: (() => {
              const date = ponto.date || ponto.created_at;
              return date ? new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }) : 'Sem dado';
            })()
          }
        };
      })
    ]
  } : null;

  // Gerar dados do mapa
  const infraData = generateInfraData(selectedInfra);
  const pdcData = generatePdcData(selectedPdc, execucaoCicloviaria);
  const contagemMapData = generateContagemData(selectedContagem, processedContagemData, {
    genero: selectedGenero,
    ano: selectedAno,
    area: selectedArea,
    idade: selectedIdade
  });
  const layersConf = generateLayersConf(selectedInfra, selectedPdc, infraOptions, pdcOptions);
  



  
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
    <CicloDadosErrorBoundary>
      <ClientOnly fallback={<CicloDadosLoader />}>
        <div className="flex flex-col h-screen w-full overflow-hidden" style={{height: '100vh', maxHeight: '100vh', maxWidth: '100vw'}}>
          <CicloDadosHeader 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
            onZoomToStreet={handleZoomToStreet}
          />

          <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 64px)'}}>
            {/* TODO: Descomentar condição quando implementar mural: {viewMode === 'map' && ( */}
            <LeftSidebar
                isOpen={leftSidebarOpen}
                onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                infraOptions={infraOptions}
                selectedInfra={selectedInfra}
                onInfraToggle={toggleInfraOption}
                onInfraToggleAll={toggleAllInfraOptions}
                contagemOptions={contagemOptions}
                selectedContagem={selectedContagem}
                onContagemToggle={toggleContagemOption}
                onContagemToggleAll={toggleAllContagemOptions}
                pdcOptions={pdcOptions}
                selectedPdc={selectedPdc}
                onPdcToggle={togglePdcOption}
                onPdcToggleAll={toggleAllPdcOptions}
                infracaoOptions={infracaoOptions}
                selectedInfracao={selectedInfracao}
                onInfracaoToggle={toggleInfracaoOption}
                onInfracaoToggleAll={toggleAllInfracaoOptions}
                sinistroOptions={sinistroOptions}
                selectedSinistro={selectedSinistro}
                onSinistroToggle={toggleSinistroOption}
                onSinistroToggleAll={toggleAllSinistroOptions}
                estacionamentoOptions={estacionamentoOptions}
                selectedEstacionamento={selectedEstacionamento}
                onEstacionamentoToggle={toggleEstacionamentoOption}
                onEstacionamentoToggleAll={toggleAllEstacionamentoOptions}
                perfilOptions={perfilOptions}
                selectedPerfil={selectedPerfil}
                onPerfilToggle={togglePerfilOption}
                onPerfilToggleAll={toggleAllPerfilOptions}
                selectedGenero={selectedGenero}
                onGeneroChange={setSelectedGenero}
                selectedAno={selectedAno}
                onAnoChange={setSelectedAno}
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
                selectedIdade={selectedIdade}
                onIdadeChange={setSelectedIdade}
                onClearAll={clearAllSelections}
                onSelectAll={selectAllOptions}
                onReloadMapData={handleReloadMapData}
                onReloadGeneralData={handleReloadGeneralData}
                loadingStates={{
                  infra: false,
                  pdc: false,
                  sinistros: false,
                  estacionamento: false
                }}
              />
            {/* TODO: Descomentar quando implementar mural: )} */}

            <main className="flex-1 relative">
              {/* TODO: Descomentar condição quando implementar mural: {viewMode === 'map' ? ( */}
              <MapView
                selectedInfra={selectedInfra}
                selectedPdc={selectedPdc}
                selectedContagem={selectedContagem}
                selectedEstacionamento={selectedEstacionamento}
                selectedSinistro={selectedSinistro}
                selectedPerfil={selectedPerfil}
                selectedGenero={selectedGenero}
                selectedAno={selectedAno}
                selectedArea={selectedArea}
                selectedIdade={selectedIdade}
                infraOptions={infraOptions}
                pdcOptions={pdcOptions}
                layersConf={layersConf}
                infraData={infraData}
                pdcData={pdcData}
                contagemData={contagemMapData}
                getContagemIcon={getContagemIcon}
                onPointClick={handlePointClick}
                externalViewState={mapViewState}
                highlightedStreet={selectedStreetGeometry}
                streetData={selectedStreetData}
                selectedStreetFilter={selectedStreetFilter}
                perfilCiclistasData={processedPerfilData}
              />
              {/* TODO: Descomentar quando implementar mural:
              ) : (
                <MuralView 
                  sidebarOpen={leftSidebarOpen}
                  onSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                />
              )}
              */}
            </main>

            {/* <RightSidebar
              isOpen={rightSidebarOpen}
              onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
              viewMode={viewMode}
              mapSelection={mapSelection}
            /> */}
            

          </div>

          {/* <FloatingChat
            isOpen={chatOpen}
            onToggle={() => setChatOpen(!chatOpen)}
          /> */}
        </div>
      </ClientOnly>
    </CicloDadosErrorBoundary>
  );
}