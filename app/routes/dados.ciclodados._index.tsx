import { useEffect } from 'react';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { CicloDadosErrorBoundary } from '~/components/CicloDados/ErrorBoundary';
import { ClientOnly, CicloDadosLoader } from '~/components/CicloDados/ClientOnly';
import { useCicloDadosMap } from '~/hooks/useCicloDadosMap';
import { useProcessedData } from '~/hooks/useProcessedData';
import {
  CicloDadosHeader,
  LeftSidebar,
  MapView,
  useCicloDadosData,
  useCicloDadosState,
  generateInfraData,
  generatePdcData,
  generateContagemData,
  getContagemIcon,
  generateLayersConf
} from '~/components/CicloDados';

export const meta: MetaFunction = () => {
  return [
    { title: "CicloDados - Dados de Ciclismo Urbano" },
    { name: "description", content: "Visualização de dados de ciclismo urbano, contagens, infraestrutura e perfil de ciclistas" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  const zoom = url.searchParams.get('zoom');
  const modalOpen = url.searchParams.get('modal');
  const modalTab = url.searchParams.get('tab');
  
  try {
    const [amecicloResponse, perfilResponse] = await Promise.all([
      fetch('https://cyclist-counts.atlas.ameciclo.org/v1/locations'),
      fetch('https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/survey-locations')
    ]);
    
    const amecicloData = amecicloResponse.ok ? await amecicloResponse.json() : [];
    const perfilData = perfilResponse.ok ? await perfilResponse.json() : null;
    
    return json({ 
      contagemData: {
        ameciclo: amecicloData,
        prefeitura: []
      }, 
      execucaoCicloviaria: null,
      perfilCiclistas: perfilData,
      initialViewState: lat && lon && zoom ? {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        zoom: parseFloat(zoom)
      } : null,
      modalState: modalOpen ? {
        open: modalOpen === 'true',
        tab: modalTab || 'overview'
      } : null
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return json({ 
      contagemData: {
        ameciclo: [],
        prefeitura: []
      }, 
      execucaoCicloviaria: null,
      perfilCiclistas: null,
      initialViewState: null,
      modalState: null
    });
  }
}

export default function CicloDados() {
  const { contagemData, execucaoCicloviaria, perfilCiclistas, initialViewState, modalState } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  const {
    mapSelection,
    mapViewState,
    autoOpenPopup,
    selectedStreetGeometry,
    selectedStreetData,
    selectedStreetFilter,
    handlePointClick,
    handleZoomToStreet,
    handleZoomIn,
    handleZoomOut,
    handleMapMove,
    setAutoOpenPopup
  } = useCicloDadosMap(initialViewState);
  
  const { processedPerfilData, processedContagemData } = useProcessedData(contagemData, perfilCiclistas);
  
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
    toggleGeneroOption,
    selectedAno,
    setSelectedAno,
    toggleAnoOption,
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

  const infraData = generateInfraData(selectedInfra);
  const pdcData = generatePdcData(selectedPdc, execucaoCicloviaria);
  const contagemMapData = generateContagemData(selectedContagem, processedContagemData, {
    genero: selectedGenero,
    ano: selectedAno,
    area: selectedArea,
    idade: selectedIdade
  });
  const layersConf = generateLayersConf(selectedInfra, selectedPdc, infraOptions, pdcOptions);

  const handleReloadMapData = () => {
    revalidator.revalidate();
  };
  
  const handleReloadGeneralData = () => {
    selectAllOptions();
    revalidator.revalidate();
  };

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
                onGeneroChange={toggleGeneroOption}
                selectedAno={selectedAno}
                onAnoChange={toggleAnoOption}
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

            <main className="flex-1 relative">
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
                onMapMove={handleMapMove}
                highlightedStreet={selectedStreetGeometry}
                streetData={selectedStreetData}
                selectedStreetFilter={selectedStreetFilter}
                perfilCiclistasData={processedPerfilData}
                autoOpenPopup={autoOpenPopup}
                onPopupOpened={() => setAutoOpenPopup(null)}
              />
            </main>
          </div>
        </div>
      </ClientOnly>
    </CicloDadosErrorBoundary>
  );
}
