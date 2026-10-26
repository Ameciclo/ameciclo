import type { LineGeometry } from "./geometry";
import { normalizeText, getScoreBandMeta } from "./format";
import { CRITERION_CODES, PartialFormDataSchema, type PartialFormData } from "~/lib/ideciclo/form-types";
import { getCriterionRatingScale, type CriterionScaleDescription } from "~/lib/ideciclo/rating-descriptions";
import { parseResponses, type PersistedResponses, type PersistedSection, type Rating } from "./persisted";

// Plain, serializable views of the ideciclo_* rows, with the city prefix already
// stripped from the segment ids (see queries/public.ts).
export type PublicCity = {
  id: string;
  name: string;
  state: string;
  // Stored index (0 to 1); 0 until the city is released.
  ideciclo: number;
  structuralKm: number;
  feederKm: number;
  localKm: number;
};

export type PublicSegment = {
  id: string;
  name: string;
  type: string;
  length: number;
  neighborhood: string | null;
  classification: string | null;
  parentSegmentId: string | null;
  geometry: LineGeometry | null;
};

export type PublicForm = {
  id: string;
  segmentId: string;
  streetName: string | null;
  hierarchy: string | null;
  intersectionsCount: number | null;
  blocksCount: number | null;
  responses: unknown;
};

export const NETWORK_CONFIG = {
  estrutural: { label: "Estrutural", weight: 0.6, cityField: "structuralKm" },
  alimentadora: { label: "Alimentadora", weight: 0.25, cityField: "feederKm" },
  local: { label: "Local", weight: 0.15, cityField: "localKm" },
} as const;

export type NetworkKey = keyof typeof NETWORK_CONFIG;

const NETWORK_KEYS: NetworkKey[] = ["estrutural", "alimentadora", "local"];

export type ScoreBandKey = "score-75-plus" | "score-50-plus" | "score-25-plus" | "score-below-25" | "score-unavailable";

export interface SegmentResultEntry {
  id: string;
  displayName: string;
  neighborhood: string | null;
  typeLabel: string;
  hierarchy: NetworkKey | null;
  hierarchyLabel: string;
  lengthKm: number;
  evaluated: boolean;
  formId: string | null;
  score: number | null;
  scoreBand: ScoreBandKey;
  a1Rating: Rating | null;
  adequate: boolean | null;
  contributes: boolean;
  contribution: number;
}

export interface NetworkResultEntry {
  key: NetworkKey;
  label: string;
  weight: number;
  totalRoadKm: number;
  structuresCount: number;
  evaluatedCount: number;
  pendingCount: number;
  structureKm: number;
  evaluatedKm: number;
  adequateKm: number;
  contributionSum: number;
  gam: number | null;
  weightedContribution: number;
}

export interface CityResultsSummary {
  totalStructures: number;
  evaluatedStructures: number;
  pendingStructures: number;
  totalStructureKm: number;
  evaluatedStructureKm: number;
  classifiedStructures: number;
  unclassifiedStructures: number;
  incompatibleStructures: number;
  validStructures: number;
  validStructureKm: number;
  previewIdeciclo: number;
  officialReady: boolean;
  totalRoadKm: number;
}

export interface CityResultsBreakdown {
  segments: SegmentResultEntry[];
  networks: Record<NetworkKey, NetworkResultEntry>;
  summary: CityResultsSummary;
}

const clampScore = (value: number | null) => (value === null ? null : Math.min(Math.max(value, 0), 100));

const normalizeHierarchy = (value: string | null | undefined): NetworkKey | null => {
  const normalized = normalizeText(value);
  if (normalized.includes("estrut")) return "estrutural";
  if (normalized.includes("alimenta")) return "alimentadora";
  if (normalized.includes("local")) return "local";
  return null;
};

const getScoreBand = (score: number | null): ScoreBandKey => {
  if (score === null) return "score-unavailable";
  if (score >= 75) return "score-75-plus";
  if (score >= 50) return "score-50-plus";
  if (score >= 25) return "score-25-plus";
  return "score-below-25";
};

const resolveFormMetrics = (form: PublicForm) => {
  const responses = parseResponses(form.responses);
  const score = clampScore(responses?.total_score ?? responses?.score_breakdown?.total ?? null);
  const a1 = responses?.criterion_ratings?.A1 ?? responses?.score_breakdown?.resolvedRatings?.A1 ?? null;

  return {
    formId: form.id,
    score,
    a1Rating: a1,
    hierarchy: normalizeHierarchy(responses?.road_hierarchy) ?? normalizeHierarchy(responses?.classification) ?? normalizeHierarchy(form.hierarchy),
    displayName: (responses?.segment_name || form.streetName || "").trim() || null,
  };
};

export const calculateCityResults = (city: PublicCity, segments: PublicSegment[], forms: PublicForm[]): CityResultsBreakdown => {
  const metricsBySegmentId = new Map(forms.map((form) => [form.segmentId, resolveFormMetrics(form)]));

  const entries = segments
    .filter((segment) => !segment.parentSegmentId)
    .map((segment): SegmentResultEntry => {
      const metrics = metricsBySegmentId.get(segment.id);
      const hierarchy = normalizeHierarchy(segment.classification) ?? metrics?.hierarchy ?? null;
      const score = metrics?.score ?? null;
      const adequate = metrics ? (metrics.a1Rating ? metrics.a1Rating !== "D" : true) : null;
      const contributes = metrics !== undefined && hierarchy !== null && adequate === true && score !== null;

      return {
        id: segment.id,
        displayName: metrics?.displayName || segment.name.trim() || `Trecho ${segment.id}`,
        neighborhood: segment.neighborhood,
        typeLabel: segment.type,
        hierarchy,
        hierarchyLabel: hierarchy ? NETWORK_CONFIG[hierarchy].label : "Sem hierarquia",
        lengthKm: segment.length,
        evaluated: metrics !== undefined,
        formId: metrics?.formId ?? null,
        score,
        scoreBand: getScoreBand(score),
        a1Rating: metrics?.a1Rating ?? null,
        adequate,
        contributes,
        contribution: contributes && score !== null ? (segment.length * score) / 100 : 0,
      };
    });

  const sum = (items: SegmentResultEntry[], pick: (item: SegmentResultEntry) => number) => items.reduce((total, item) => total + pick(item), 0);

  const network = (key: NetworkKey): NetworkResultEntry => {
    const config = NETWORK_CONFIG[key];
    const totalRoadKm = city[config.cityField];
    const own = entries.filter((entry) => entry.hierarchy === key);
    const evaluated = own.filter((entry) => entry.evaluated);
    const contributionSum = sum(own, (entry) => entry.contribution);
    const gam = totalRoadKm > 0 ? contributionSum / totalRoadKm : null;

    return {
      key,
      label: config.label,
      weight: config.weight,
      totalRoadKm,
      structuresCount: own.length,
      evaluatedCount: evaluated.length,
      pendingCount: own.length - evaluated.length,
      structureKm: sum(own, (entry) => entry.lengthKm),
      evaluatedKm: sum(evaluated, (entry) => entry.lengthKm),
      adequateKm: sum(
        own.filter((entry) => entry.contributes),
        (entry) => entry.lengthKm,
      ),
      contributionSum,
      gam,
      weightedContribution: gam !== null ? gam * config.weight : 0,
    };
  };

  const networks = {
    estrutural: network("estrutural"),
    alimentadora: network("alimentadora"),
    local: network("local"),
  };

  const evaluated = entries.filter((entry) => entry.evaluated);
  const classified = entries.filter((entry) => entry.hierarchy !== null);
  const valid = entries.filter((entry) => entry.contributes);

  return {
    segments: entries,
    networks,
    summary: {
      totalStructures: entries.length,
      evaluatedStructures: evaluated.length,
      pendingStructures: entries.length - evaluated.length,
      totalStructureKm: sum(entries, (entry) => entry.lengthKm),
      evaluatedStructureKm: sum(evaluated, (entry) => entry.lengthKm),
      classifiedStructures: classified.length,
      unclassifiedStructures: entries.length - classified.length,
      incompatibleStructures: evaluated.filter((entry) => entry.adequate === false).length,
      validStructures: valid.length,
      validStructureKm: sum(valid, (entry) => entry.lengthKm),
      previewIdeciclo: NETWORK_KEYS.reduce((total, key) => total + networks[key].weightedContribution, 0),
      officialReady: entries.length > 0 && evaluated.length === entries.length && classified.length === entries.length,
      totalRoadKm: NETWORK_KEYS.reduce((total, key) => total + networks[key].totalRoadKm, 0),
    },
  };
};

// The index shown for a city: the stored one once released, the preview until then.
export const displayedIndex = (city: PublicCity, results: CityResultsBreakdown) => (city.ideciclo > 0 ? city.ideciclo : results.summary.previewIdeciclo);

// ---------------------------------------------------------------------------
// One evaluated structure, with its criteria by section.
// ---------------------------------------------------------------------------

export interface PublicCriterionDetail {
  code: string;
  label: string;
  rating: Rating | null;
  points: number | null;
  maxPoints: number;
  // What each rating A to D means for this criterion and this typology.
  scale: CriterionScaleDescription[];
  // Lines of evidence taken from the form answers.
  evidence: string[];
}

export interface PublicSectionDetail {
  key: string;
  label: string;
  score: number;
  max: number;
  criteria: PublicCriterionDetail[];
}

export const PUBLIC_CRITERION_GROUPS = [
  { key: "A", criteria: ["A1", "A2"], title: "Compatibilidade e conexão", description: "Mostra se a tipologia escolhida combina com a via e se o trecho se conecta com a rede cicloviária da cidade." },
  { key: "B", criteria: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"], title: "Projeto do trecho", description: "Reúne largura, pavimento, delimitação, sinalização, acessibilidade e situações de risco ao longo do percurso." },
  { key: "C", criteria: ["C1", "C2", "C3"], title: "Cruzamentos e conflitos", description: "Avalia como a infraestrutura se comporta nas interseções e como trata conflitos com o tráfego motorizado." },
  { key: "D", criteria: ["D1", "D2", "D3"], title: "Conforto urbano", description: "Mostra as condições de iluminação, sombreamento e mobiliário cicloviário ao longo do trecho." },
  { key: "E", criteria: ["E1", "E2", "E3", "E4"], title: "Conservação", description: "Resume o estado de manutenção do pavimento, da sinalização e dos elementos de separação do trecho." },
] as const;

export interface PublicStructureDetail {
  id: string;
  segment: PublicSegment;
  result: SegmentResultEntry;
  intersectionsCount: number | null;
  totalScore: number | null;
  scoreLabel: string;
  scoreBadgeClassName: string;
  sections: PublicSectionDetail[];
  criteria: PublicCriterionDetail[];
}

const scaleFor = (code: string, formData: PartialFormData | null): CriterionScaleDescription[] => {
  const known = CRITERION_CODES.find((candidate) => candidate === code);
  return known && formData ? getCriterionRatingScale(known, formData) : [];
};

const sectionDetail = (key: string, title: string, section: PersistedSection | undefined, formData: PartialFormData | null): PublicSectionDetail => ({
  key,
  label: title,
  score: section?.score ?? 0,
  max: section?.max ?? 0,
  // A criterion that does not apply to the typology has no points to give.
  criteria: Object.entries(section?.items ?? {})
    .filter(([, item]) => item.maxPoints > 0 || (item.points ?? null) !== null)
    .map(([code, item]) => ({
      code,
      label: item.label,
      rating: item.rating ?? null,
      points: item.points ?? null,
      maxPoints: item.maxPoints,
      scale: scaleFor(code, formData),
      evidence: [],
    })),
});

export const buildStructureDetails = (segments: PublicSegment[], forms: PublicForm[], results: CityResultsBreakdown): PublicStructureDetail[] => {
  const formsBySegmentId = new Map(forms.map((form) => [form.segmentId, form]));
  const resultsById = new Map(results.segments.map((entry) => [entry.id, entry]));

  return segments.flatMap((segment) => {
    const result = resultsById.get(segment.id);
    if (!result) return [];

    const form = formsBySegmentId.get(segment.id) ?? null;
    const responses: PersistedResponses | null = form ? parseResponses(form.responses) : null;
    const parsedForm = form ? PartialFormDataSchema.safeParse(form.responses) : null;
    const formData = parsedForm?.success ? parsedForm.data : null;
    const sections = PUBLIC_CRITERION_GROUPS.map((group) => sectionDetail(group.key, group.title, responses?.score_breakdown?.sections?.[group.key], formData)).filter(
      (section) => section.criteria.length > 0,
    );
    const scoreMeta = getScoreBandMeta(result.score);

    return [
      {
        id: segment.id,
        segment,
        result,
        intersectionsCount: form?.intersectionsCount ?? responses?.intersections_count ?? null,
        totalScore: result.score,
        scoreLabel: scoreMeta.label,
        scoreBadgeClassName: scoreMeta.className,
        sections,
        criteria: sections.flatMap((section) => section.criteria),
      },
    ];
  });
};

export const getTopAndBottomCriteria = (detail: PublicStructureDetail) => {
  const rated = detail.criteria.filter((criterion) => criterion.rating !== null);
  const order = (rating: Rating | null) => ({ A: 4, B: 3, C: 2, D: 1 })[rating ?? "D"];
  const sorted = [...rated].sort((left, right) => order(right.rating) - order(left.rating));
  return {
    strengths: sorted.filter((item) => item.rating === "A" || item.rating === "B").slice(0, 3),
    attention: [...sorted]
      .reverse()
      .filter((item) => item.rating === "C" || item.rating === "D")
      .slice(0, 3),
  };
};

export const getComparisonFriendlyTitle = (detail: PublicStructureDetail) => detail.segment.name || detail.result.displayName || `Trecho ${detail.id}`;

const byTypology = (details: PublicStructureDetail[]) => {
  const stats = new Map<string, { count: number; km: number; evaluated: number }>();
  for (const detail of details) {
    const label = detail.result.typeLabel || "Sem tipologia";
    const current = stats.get(label) ?? { count: 0, km: 0, evaluated: 0 };
    current.count += 1;
    current.km += detail.result.lengthKm;
    current.evaluated += detail.result.evaluated ? 1 : 0;
    stats.set(label, current);
  }
  return [...stats].map(([label, value]) => ({ label, ...value })).sort((left, right) => right.km - left.km);
};

export const buildTypologyStats = byTypology;

export const getMostCommonTypology = (details: PublicStructureDetail[]) => {
  const [top] = byTypology(details);
  return top ? { label: top.label, count: top.count, km: top.km } : null;
};

export const getStructureStatusLabel = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) return "Ainda não avaliada";
  if (segment.adequate === false) return "Incompatível para o índice";
  if (segment.hierarchy === null) return "Sem hierarquia definida";
  if (segment.score === null) return "Avaliada sem nota final";
  return "Entra no cálculo da cidade";
};

export const getStructureStatusBadgeClassName = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) return "border-slate-200 bg-slate-100 text-slate-700";
  if (segment.adequate === false) return "border-rose-200 bg-rose-50 text-rose-700";
  if (segment.contributes) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const getStructureDetailsPath = (cityId: string, segmentId: string) => `/detalhes-cidades/${cityId}/estruturas/${segmentId}`;


