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
  lat?: number;
  lon?: number;
  zoom?: number;
  modal?: string;
  tab?: string;
  // Camadas desligadas no painel (ver useLayerSelection); guardado aqui para a URL não perdê-lo.
  off?: string;
};

// O roteador converte valores numéricos da URL em número ("-8.11" vira -8.11). Aceitamos número ou texto numérico e guardamos
// número: como texto, ele reescreveria o endereço entre aspas e a posição se perderia.
const number = (value: unknown) => {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const text = (value: unknown) => (typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined);

export const Route = createFileRoute("/dados/ciclodados/")({
  validateSearch: (search: Record<string, unknown>): CicloDadosSearch => ({
    lat: number(search.lat),
    lon: number(search.lon),
    zoom: number(search.zoom),
    modal: text(search.modal),
    tab: text(search.tab),
    off: text(search.off),
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

  const initialViewState = lat !== undefined && lon !== undefined && zoom !== undefined ? { latitude: lat, longitude: lon, zoom } : null;

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
