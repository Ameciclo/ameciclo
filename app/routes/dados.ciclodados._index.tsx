import { useEffect, useState } from 'react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  // Remover fetch do servidor para evitar timeout
  return json({ bicicletarios: null });
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
  generateInfraData,
  generatePdcData,
  generateContagemData,
  getContagemIcon,
  generateLayersConf
} from '~/components/CicloDados';

export default function CicloDados() {
  // Dados carregados via hooks no cliente
  const { bicicletarios } = { bicicletarios: null };
  
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
    setViewMode
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
    setMapSelection(coords);
  };

  // Gerar dados do mapa
  const infraData = generateInfraData(selectedInfra);
  const pdcData = generatePdcData(selectedPdc);
  const contagemData = generateContagemData(selectedContagem);
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
          />
        )}

        <main className="flex-1 relative">
          {viewMode === 'map' ? (
            <MapView
              selectedInfra={selectedInfra}
              selectedPdc={selectedPdc}
              selectedContagem={selectedContagem}
              selectedEstacionamento={selectedEstacionamento}
              infraOptions={infraOptions}
              pdcOptions={pdcOptions}
              layersConf={layersConf}
              infraData={infraData}
              pdcData={pdcData}
              contagemData={contagemData}
              getContagemIcon={getContagemIcon}
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