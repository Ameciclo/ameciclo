import type { PointInfo } from '@ameciclo/db';
import templates from '~/data/ciclodados-prompt-templates.json';

// O assistente de documentos: monta, a partir dos dados REAIS do ponto escolhido, um pedido (prompt) pronto para colar numa
// IA de texto. Nada é inventado aqui: cada categoria só existe se o ponto tem dado dela, e o texto manda a IA não criar números.

export const TEMPLATES = templates;
export type Choice = { id: string; label: string };

// As contagens que o popup já reuniu (da Ameciclo e da Prefeitura), no que o prompt precisa.
export type PromptCount = { name: string; date: string; total: number; distance: number; source: string };

export type PromptInput = {
  documentType: string;
  objective: string;
  audience: string;
  tone: string;
  size: string;
  categories: string[];
  options: { tables: boolean; recommendations: boolean; legal: boolean; limitations: boolean };
  notes: string;
  place: { street: string; city: string; lat: number; lng: number; radius: number };
};

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));

const n = (value: number) => value.toLocaleString('pt-BR');
const list = (items: string[]) => items.map((item) => `- ${item}`);

type Category = { summary: string; details: string[]; source: string };

// O resumo de cada categoria de dados, ou `null` se o ponto não tem nada dela.
export function categoryData(id: string, info: PointInfo, counts: PromptCount[]): Category | null {
  const template = TEMPLATES.dataCategories.find((c) => c.id === id)?.summaryTemplate ?? '';
  switch (id) {
    case 'sinistros': {
      const years = info.emergency_calls.annual_history;
      const total = years.reduce((sum, y) => sum + y.total_calls, 0);
      if (total === 0) return null;
      const byYear = [...years].reverse();
      return {
        summary: fill(template, { total: n(total), firstYear: byYear[0].year, lastYear: byYear[byYear.length - 1].year }),
        details: [
          `Por ano: ${byYear.map((y) => `${y.year} (${n(y.total_calls)})`).join(', ')}`,
          ...(info.emergency_calls.by_category.length > 0
            ? [`Tipos mais frequentes: ${info.emergency_calls.by_category.slice(0, 3).map((c) => `${c.category || 'não informado'} (${n(c.count)})`).join(', ')}`]
            : []),
        ],
        source: 'SAMU Recife, chamados de sinistro de trânsito',
      };
    }
    case 'infraestrutura': {
      const { existing, planned_pdc: planned } = info.cycling_infra;
      if (existing.length + planned.length === 0) return null;
      return {
        summary: fill(template, { existing: existing.length, planned: planned.length }),
        details: [
          ...existing.slice(0, 5).map((e) => `${e.type}: ${e.name} (a ${n(e.distance_meters)} m)`),
          ...planned.slice(0, 5).map((p) => `PDC ${p.pdc_ref}: ${p.name} (${p.typology})`),
        ],
        source: 'OpenStreetMap (estrutura existente) e Plano Diretor Cicloviário',
      };
    }
    case 'contagens': {
      if (counts.length === 0) return null;
      const latest = [...counts].sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        summary: fill(template, { totalCounts: counts.length, latestYear: latest.date.slice(0, 4), latestTotal: n(latest.total) }),
        details: counts.slice(0, 5).map((c) => `${c.name} (${c.date.slice(0, 4)}, ${c.source}, a ${n(c.distance)} m): ${n(c.total)} ciclistas`),
        source: 'Contagens de ciclistas da Ameciclo e da Prefeitura do Recife',
      };
    }
    case 'perfil': {
      const { total_profiles: total, by_edition: editions } = info.cyclist_profile;
      if (total === 0) return null;
      return {
        summary: fill(template, { totalProfiles: n(total), editions: editions.map((e) => e.edition).join(', ') }),
        details: editions.map((e) => `Edição ${e.edition}: ${n(e.total_profiles)} entrevistas`),
        source: 'Pesquisa de perfil de ciclistas da Ameciclo',
      };
    }
    case 'bicicletarios': {
      const { total, total_capacity: capacity, items } = info.bike_racks;
      if (total === 0) return null;
      return {
        summary: fill(template, { total: n(total), capacity: n(capacity) }),
        details: items.slice(0, 3).map((r) => `${r.name}: ${r.capacity === 'Não informada' ? 'vagas não informadas' : `${r.capacity} vagas`}, a ${n(r.distance_meters)} m`),
        source: 'OpenStreetMap',
      };
    }
    case 'bike_share': {
      const stations = info.shared_bike.stations;
      if (stations.length === 0) return null;
      return {
        summary: fill(template, { total: stations.length }),
        details: stations.slice(0, 3).map((s) => `${s.name}, a ${n(s.distance_meters)} m`),
        source: 'OpenStreetMap',
      };
    }
    default:
      return null;
  }
}

const label = (choices: Choice[], id: string) => choices.find((c) => c.id === id)?.label ?? id;
const isKey = <T extends object>(object: T, key: string): key is Extract<keyof T, string> => key in object;

export function buildPrompt(input: PromptInput, info: PointInfo, counts: PromptCount[]): string {
  const t = TEMPLATES.promptTemplates;
  const { place } = input;
  const header = isKey(t.documentHeaders, input.documentType) ? t.documentHeaders[input.documentType] : t.documentHeaders.outro;
  const structure = isKey(t.structures, input.documentType) ? t.structures[input.documentType] : t.structures.outro;
  const toneRules = isKey(t.instructionRules.byTone, input.tone) ? t.instructionRules.byTone[input.tone] : [];
  const sizeRule = isKey(t.instructionRules.bySize, input.size) ? t.instructionRules.bySize[input.size] : '';

  const lines: string[] = [
    t.systemHeader.trim(),
    '',
    fill(header, { street: place.street, city: place.city, radius: place.radius, lat: place.lat.toFixed(5), lng: place.lng.toFixed(5) }),
    '',
    `Objetivo: ${label(TEMPLATES.quickObjectives, input.objective)}.`,
    `Público-alvo: ${label(TEMPLATES.audiences, input.audience)}.`,
    `Tom: ${label(TEMPLATES.tones, input.tone)}.`,
    '',
    'DADOS DISPONÍVEIS (CicloDados, Ameciclo). Use apenas estes números; não acrescente dados que não estejam aqui:',
  ];

  for (const id of input.categories) {
    const data = categoryData(id, info, counts);
    if (!data) continue;
    lines.push('', `## ${label(TEMPLATES.dataCategories, id)}`, data.summary, ...list(data.details), `Fonte: ${data.source}.`);
  }

  lines.push('', 'ESTRUTURA SUGERIDA:', ...structure.map((section, i) => `${i + 1}. ${section}`));

  const rules = [
    ...t.instructionRules.default,
    ...toneRules,
    ...(sizeRule ? [sizeRule] : []),
    ...(input.options.tables ? [t.instructionRules.includeTables] : []),
    ...(input.options.recommendations ? [t.instructionRules.includeRecommendations] : []),
    ...(input.options.legal ? [t.instructionRules.includeLegalBasis] : []),
    ...(input.options.limitations ? [t.instructionRules.includeLimitations] : []),
  ];
  lines.push('', 'INSTRUÇÕES:', ...list(rules));

  if (input.notes.trim()) lines.push('', 'CONTEXTO ADICIONAL DA PESSOA SOLICITANTE:', input.notes.trim());
  return lines.join('\n');
}
