import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
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
import { seo } from '~/utils/seo';
import { ciclodadosQueryOptions } from '~/queries/dados.ciclodados';
import { RouteErrorBoundary } from '~/components/Commom/RouteBoundaries';

type CicloDadosSearch = {
  lat?: string;
  lon?: string;
  zoom?: string;
  modal?: string;
  tab?: string;
};

export const Route = createFileRoute("/dados/ciclodados/")({
  validateSearch: (search: Record<string, unknown>): CicloDadosSearch => ({
    lat: typeof search.lat === "string" ? search.lat : undefined,
    lon: typeof search.lon === "string" ? search.lon : undefined,
    zoom: typeof search.zoom === "string" ? search.zoom : undefined,
    modal: typeof search.modal === "string" ? search.modal : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(ciclodadosQueryOptions()),
  head: () =>
    seo({
      title: "CicloDados - Dados de Ciclismo Urbano - Ameciclo",
      description:
        "Visualização de dados de ciclismo urbano, contagens, infraestrutura e perfil de ciclistas",
      pathname: "/dados/ciclodados",
    }),
  component: CicloDados,
  errorComponent: RouteErrorBoundary,
});

function CicloDados() {
  const { data: { contagemData, execucaoCicloviaria, perfilCiclistas } } =
    useSuspenseQuery(ciclodadosQueryOptions());
  const { lat, lon, zoom, modal, tab } = Route.useSearch();

  const initialViewState =
    lat && lon && zoom
      ? {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          zoom: parseFloat(zoom),
        }
      : null;
  const modalState = modal
    ? { open: modal === "true", tab: tab || "overview" }
    : null;

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
    // revalidation handled by TanStack Router
  };

  const handleReloadGeneralData = () => {
    selectAllOptions();
    // revalidation handled by TanStack Router
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
