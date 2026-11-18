import type { ExpressionSpecification } from 'maplibre-gl';
import type { LayerProps } from 'react-map-gl/maplibre';

// As camadas de infraestrutura e do PDC no mapa. Os dois conjuntos leem o MESMO GeoJSON (um trecho de via com
// `infra_type`, a estrutura construída, e `status`, a situação no PDC); cada camada só existe se a opção dela está marcada,
// então desmarcar uma opção a tira do mapa de verdade, sem depender de como os dados foram filtrados.

const ROUND = { 'line-join': 'round', 'line-cap': 'round' } as const;

// Situação no PDC -> como desenhar (duas linhas paralelas, uma de cada lado da via).
export const PDC_STYLES: Record<string, { color: string; dasharray?: number[] }> = {
  pdc_nao_realizado: { color: '#EC4899', dasharray: [0.1, 3] },
  pdc_realizado_designado: { color: '#10B981' },
  pdc_realizado_nao_designado: { color: '#8B5CF6', dasharray: [4, 2] },
  realizado_fora_pdc: { color: '#F59E0B', dasharray: [2, 2] },
};

// Ordem de baixo para cima: o que não saiu do papel fica por baixo.
const PDC_ORDER = ['pdc_nao_realizado', 'pdc_realizado_designado', 'pdc_realizado_nao_designado', 'realizado_fora_pdc'];

const INFRA_STYLES: Record<string, { color: string; width: number; extra?: 'ciclorrota' }> = {
  Ciclovia: { color: '#EF4444', width: 4 },
  Ciclofaixa: { color: '#6B7280', width: 3 },
  Ciclorrota: { color: '#9CA3AF', width: 3, extra: 'ciclorrota' },
  'Calçada compartilhada': { color: '#10B981', width: 3 },
};

const widthByZoom = (small: number, mid: number, big: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 10, small, 16, mid, 20, big];

export function buildCyclingLayers(selectedInfra: string[], selectedPdcKeys: string[]): LayerProps[] {
  const layers: LayerProps[] = [];

  for (const status of PDC_ORDER.filter((s) => selectedPdcKeys.includes(s))) {
    const { color, dasharray } = PDC_STYLES[status];
    for (const side of [-1, 1]) {
      layers.push({
        id: `pdc-${status}-${side < 0 ? 'left' : 'right'}`,
        type: 'line',
        filter: ['==', ['get', 'status'], status],
        paint: { 'line-color': color, 'line-width': 2, 'line-offset': 4 * side, ...(dasharray ? { 'line-dasharray': dasharray } : {}) },
        layout: ROUND,
      });
    }
  }

  for (const [type, style] of Object.entries(INFRA_STYLES)) {
    if (!selectedInfra.includes(type)) continue;
    layers.push({
      id: `infra-${type}`,
      type: 'line',
      filter: ['==', ['get', 'infra_type'], type],
      paint: { 'line-color': style.color, 'line-width': style.extra ? widthByZoom(2, 6, 12) : style.width, 'line-opacity': 0.8 },
      layout: ROUND,
    });
    if (style.extra === 'ciclorrota') {
      // Os "blocos" vermelhos que marcam a ciclorrota.
      layers.push({
        id: `infra-${type}-marcas`,
        type: 'symbol',
        filter: ['==', ['get', 'infra_type'], type],
        paint: { 'text-color': '#EF4444', 'text-opacity': 0.8 },
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 20,
          'text-field': '█',
          'text-size': widthByZoom(2, 4, 8),
          'text-rotation-alignment': 'map',
          'text-pitch-alignment': 'viewport',
        },
      });
    }
  }

  return layers;
}
