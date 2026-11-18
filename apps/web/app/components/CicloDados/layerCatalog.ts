import { Navigation, BarChart3, AlertTriangle, MapPin, Route, User, Users, ParkingSquare, type LucideIcon } from 'lucide-react';

// O catálogo de camadas do CicloDados: o que o painel lista e o que o mapa sabe desenhar. Os ids de grupo são os
// que vão para a URL (`?off=`), os nomes das opções são os que o painel mostra.

export type LayerOption = { name: string; color?: string; pattern?: string; apiKey?: string };
export type LayerGroupId = 'infra' | 'contagem' | 'pdc' | 'estacionamento' | 'perfil' | 'infracao' | 'sinistro' | 'rota' | 'ideciclo';
export type LayerGroup = { id: LayerGroupId; title: string; icon: LucideIcon; options: LayerOption[]; comingSoon?: boolean };

export const infraOptions: LayerOption[] = [
  { name: 'Ciclovia', color: '#EF4444', pattern: 'solid' },
  { name: 'Ciclofaixa', color: '#6B7280', pattern: 'bordered' },
  { name: 'Ciclorrota', color: '#D1D5DB', pattern: 'arrows' },
  { name: 'Calçada compartilhada', color: '#10B981', pattern: 'solid' },
];

// `apiKey` é o `status` que o banco devolve para o trecho (ver utils/cyclingLayers.ts).
export const pdcOptions: (LayerOption & { apiKey: string })[] = [
  { name: 'PDC Realizado Designado', color: '#10B981', pattern: 'parallel', apiKey: 'pdc_realizado_designado' },
  { name: 'PDC Realizado Não Designado', color: '#8B5CF6', pattern: 'parallel-dashed', apiKey: 'pdc_realizado_nao_designado' },
  { name: 'Realizado Fora PDC', color: '#F59E0B', pattern: 'parallel-orange-dashed', apiKey: 'realizado_fora_pdc' },
  { name: 'PDC Não Realizado', color: '#EC4899', pattern: 'striped', apiKey: 'pdc_nao_realizado' },
];

export const contagemOptions = ['Contagem da Ameciclo', 'Contagem da Prefeitura'];
export const estacionamentoOptions = ['Bicicletários', 'Estações de Bike PE'];
// As edições da pesquisa de perfil de ciclistas.
export const perfilOptions = ['2024', '2021', '2018', '2015'];

export const GROUPS: LayerGroup[] = [
  { id: 'infra', title: 'Infraestrutura cicloviária', icon: Route, options: infraOptions },
  { id: 'contagem', title: 'Contagem de ciclistas', icon: Users, options: contagemOptions.map((name) => ({ name })) },
  { id: 'pdc', title: 'Plano Diretor Cicloviário', icon: MapPin, options: pdcOptions },
  { id: 'estacionamento', title: 'Estacionamento e compartilhamento', icon: ParkingSquare, options: estacionamentoOptions.map((name) => ({ name })) },
  { id: 'perfil', title: 'Perfil de ciclistas', icon: User, options: perfilOptions.map((name) => ({ name })) },
  { id: 'infracao', title: 'Infrações de trânsito', icon: AlertTriangle, options: [], comingSoon: true },
  { id: 'sinistro', title: 'Sinistro com vítima', icon: AlertTriangle, options: [], comingSoon: true },
  { id: 'rota', title: 'Rota', icon: Navigation, options: [], comingSoon: true },
  { id: 'ideciclo', title: 'IDECiclo', icon: BarChart3, options: [], comingSoon: true },
];

export const LIVE_GROUPS = GROUPS.filter((g) => !g.comingSoon);
