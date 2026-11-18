import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CicloDadosErrorBoundary } from '~/components/CicloDados/ErrorBoundary';
import { ClientOnly, CicloDadosLoader } from '~/components/CicloDados/ClientOnly';
import { useCicloDadosMap } from '~/components/CicloDados/hooks/useCicloDadosMap';
import { useProcessedData } from '~/components/CicloDados/hooks/useProcessedData';
import {
  CicloDadosHeader,
  LeftSidebar,
  MapView,
  useLayerSelection,
  generateContagemData,
  getContagemIcon,
} from '~/components/CicloDados';
import { pdcOptions } from '~/components/CicloDados/layerCatalog';
import { seo } from '~/utils/seo';
import { ciclodadosQueryOptions } from '~/queries/dados.ciclodados';
import { RouteErrorBoundary } from '~/components/Commom/RouteBoundaries';

type CicloDadosSearch = {
  lat?: string;
  lon?: string;
  zoom?: string;
  modal?: string;
  tab?: string;
  // Camadas desligadas no painel (ver useLayerSelection); guardado aqui para a URL não perdê-lo.
  off?: string;
};

export const Route = createFileRoute("/dados/ciclodados/")({
  validateSearch: (search: Record<string, unknown>): CicloDadosSearch => ({
    lat: typeof search.lat === "string" ? search.lat : undefined,
    lon: typeof search.lon === "string" ? search.lon : undefined,
    zoom: typeof search.zoom === "string" ? search.zoom : undefined,
    modal: typeof search.modal === "string" ? search.modal : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
    off: typeof search.off === "string" ? search.off : undefined,
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
  const { data: { contagemData, perfilCiclistas } } =
    useSuspenseQuery(ciclodadosQueryOptions());
  const { lat, lon, zoom } = Route.useSearch();

  const initialViewState =
    lat && lon && zoom
      ? {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          zoom: parseFloat(zoom),
        }
      : null;

  const {
    mapViewState,
    autoOpenPopup,
    selectedStreetGeometry,
    handlePointClick,
    handleZoomToStreet,
    handleMapMove,
    setAutoOpenPopup
  } = useCicloDadosMap(initialViewState);

  const { processedPerfilData, processedContagemData } = useProcessedData(contagemData, perfilCiclistas);

  const selection = useLayerSelection();
  const contagemMapData = generateContagemData(selection.selected('contagem'), processedContagemData);

  return (
    <CicloDadosErrorBoundary>
      <ClientOnly fallback={<CicloDadosLoader />}>
        <div className="flex flex-col h-screen w-full overflow-hidden" style={{height: '100vh', maxHeight: '100vh', maxWidth: '100vw'}}>
          <CicloDadosHeader onZoomToStreet={handleZoomToStreet} />

          <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 64px)'}}>
            <LeftSidebar selection={selection} />

            <main className="flex-1 relative">
              <MapView
                selectedInfra={selection.selected('infra')}
                selectedPdc={selection.selected('pdc')}
                selectedContagem={selection.selected('contagem')}
                selectedEstacionamento={selection.selected('estacionamento')}
                selectedAno={selection.selected('perfil')}
                pdcOptions={pdcOptions}
                contagemData={contagemMapData}
                getContagemIcon={getContagemIcon}
                onPointClick={handlePointClick}
                externalViewState={mapViewState}
                onMapMove={handleMapMove}
                highlightedStreet={selectedStreetGeometry}
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
