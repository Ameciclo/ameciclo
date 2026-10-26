import { type CityResultsBreakdown, NETWORK_CONFIG, NETWORK_KEYS, type NetworkKey, type ScoreBandKey, type SegmentResultEntry } from "./results";

// Formatting, filtering and the ranking checklist of the city results screen.

const pt = (value: number, digits: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatKm = (value: number) => pt(value, 2);
export const formatCount = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
export const formatIndex = (value: number) => pt(value, 3);
export const formatScore = (value: number | null) => (value === null ? "-" : pt(value, 1));
export const formatPercent = (value: number) => `${pt(value, 1)}%`;
export const formatCountLabel = (value: number, singular: string, plural: string) => `${value} ${value === 1 ? singular : plural}`;

export const SCORE_BAND_LABELS: Record<ScoreBandKey, string> = {
  "score-75-plus": "75 a 100",
  "score-50-plus": "50 a 74,9",
  "score-25-plus": "25 a 49,9",
  "score-below-25": "0 a 24,9",
  "score-unavailable": "Sem nota",
};

const SCORE_BANDS: ScoreBandKey[] = ["score-75-plus", "score-50-plus", "score-25-plus", "score-below-25", "score-unavailable"];

export const scoreBandBadgeClassName = (band: ScoreBandKey): string => {
  if (band === "score-75-plus") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (band === "score-50-plus") return "border-sky-200 bg-sky-50 text-sky-700";
  if (band === "score-25-plus") return "border-amber-200 bg-amber-50 text-amber-700";
  if (band === "score-below-25") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

export const segmentStatusLabel = (segment: SegmentResultEntry): string => {
  if (!segment.evaluated) return "Pendente";
  if (segment.adequate === false) return "A1 = D";
  if (segment.hierarchy === null) return "Sem hierarquia";
  if (segment.score === null) return "Sem nota";
  return "Entra no cálculo";
};

export const segmentStatusClassName = (segment: SegmentResultEntry): string => {
  if (!segment.evaluated) return "border-slate-200 bg-slate-100 text-slate-700";
  if (segment.adequate === false) return "border-rose-200 bg-rose-50 text-rose-700";
  if (segment.contributes) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export type StatusFilter = "todos" | "avaliados" | "nao-avaliados";
export type CalculationFilter = "todos" | "validos" | "incompativeis" | "sem-hierarquia" | "sem-nota";
export type SortField = "displayName" | "typeLabel" | "hierarchyLabel" | "status" | "lengthKm" | "score" | "contribution";
export type SortDirection = "asc" | "desc";

export type SegmentFilters = {
  search: string;
  status: StatusFilter;
  scoreBand: ScoreBandKey | "todos";
  type: string;
  hierarchy: NetworkKey | "todos";
  calculation: CalculationFilter;
  sortField: SortField;
  sortDirection: SortDirection;
};

export const DEFAULT_FILTERS: SegmentFilters = {
  search: "",
  status: "todos",
  scoreBand: "todos",
  type: "todos",
  hierarchy: "todos",
  calculation: "todos",
  sortField: "displayName",
  sortDirection: "asc",
};

/** Whether anything but the sort order narrows the list. */
export const hasActiveFilters = (filters: SegmentFilters): boolean =>
  filters.search.trim().length > 0 ||
  filters.status !== "todos" ||
  filters.scoreBand !== "todos" ||
  filters.type !== "todos" ||
  filters.hierarchy !== "todos" ||
  filters.calculation !== "todos";

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const sortValue = (segment: SegmentResultEntry, field: SortField): string | number => {
  switch (field) {
    case "displayName": return segment.displayName;
    case "typeLabel": return segment.typeLabel;
    case "hierarchyLabel": return segment.hierarchyLabel;
    case "status": return segmentStatusLabel(segment);
    case "lengthKm": return segment.lengthKm;
    case "score": return segment.score ?? -1;
    case "contribution": return segment.contribution;
  }
};

export const filterSegments = (segments: SegmentResultEntry[], filters: SegmentFilters): SegmentResultEntry[] => {
  const search = normalizeText(filters.search);

  const matches = (segment: SegmentResultEntry) =>
    (search.length === 0 ||
      normalizeText([segment.displayName, segment.id, segment.typeLabel, segment.hierarchyLabel, segment.neighborhood ?? ""].join(" ")).includes(search)) &&
    (filters.status === "todos" || (filters.status === "avaliados" ? segment.evaluated : !segment.evaluated)) &&
    (filters.scoreBand === "todos" || segment.scoreBand === filters.scoreBand) &&
    (filters.type === "todos" || segment.typeLabel === filters.type) &&
    (filters.hierarchy === "todos" || segment.hierarchy === filters.hierarchy) &&
    (filters.calculation === "todos" ||
      (filters.calculation === "validos" && segment.contributes) ||
      (filters.calculation === "incompativeis" && segment.adequate === false) ||
      (filters.calculation === "sem-hierarquia" && segment.hierarchy === null) ||
      (filters.calculation === "sem-nota" && segment.score === null));

  return segments.filter(matches).sort((first, second) => {
    const left = sortValue(first, filters.sortField);
    const right = sortValue(second, filters.sortField);
    const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "pt-BR");
    return filters.sortDirection === "asc" ? comparison : -comparison;
  });
};

export const typeOptions = (segments: SegmentResultEntry[]): string[] =>
  [...new Set(segments.map((segment) => segment.typeLabel))].sort((first, second) => first.localeCompare(second, "pt-BR"));

export type RankingReadiness = {
  // A city appears in the ranking only once at least one form is saved.
  readyToAppear: boolean;
  mandatory: { label: string; ok: boolean; detail: string }[];
  optional: { label: string; count: number; detail: string }[];
};

export const rankingReadiness = (results: CityResultsBreakdown, formsCount: number): RankingReadiness => {
  const { summary } = results;
  const missingScore = results.segments.filter((segment) => segment.evaluated && segment.score === null).length;
  const readyToAppear = formsCount > 0;

  return {
    readyToAppear,
    mandatory: [
      {
        label: "Ter ao menos um formulário salvo",
        ok: readyToAppear,
        detail: readyToAppear
          ? formatCountLabel(formsCount, "formulário salvo", "formulários salvos")
          : "Sem formulário persistido no banco. A cidade não entra no ranking até existir pelo menos uma avaliação salva.",
      },
    ],
    optional: [
      {
        label: "Trechos ainda sem avaliação",
        count: summary.pendingStructures,
        detail: summary.pendingStructures > 0 ? "Esses trechos ainda não entram no cálculo oficial da cidade." : "Todos os trechos já foram avaliados.",
      },
      {
        label: "Trechos sem hierarquia definida",
        count: summary.unclassifiedStructures,
        detail:
          summary.unclassifiedStructures > 0
            ? "A cidade aparece no ranking, mas ainda há trechos sem classificação concluída."
            : "Todas as estruturas já têm hierarquia definida.",
      },
      {
        label: "Trechos incompatíveis",
        count: summary.incompatibleStructures,
        detail: summary.incompatibleStructures > 0 ? "Trechos marcados com A1 = D ainda precisam de revisão." : "Nenhum trecho está bloqueado por incompatibilidade.",
      },
      {
        label: "Trechos sem nota final",
        count: missingScore,
        detail: missingScore > 0 ? "Alguns trechos foram avaliados, mas ainda não têm nota final." : "Todos os trechos avaliados têm nota final.",
      },
    ],
  };
};

export { NETWORK_KEYS };

export const SEGMENT_TYPE_COLORS: Record<string, string> = {
  Ciclovia: "#ea5b82",
  Ciclofaixa: "#8ea3de",
  Compartilhada: "#71e391",
  Ciclorrota: "#e9cd67",
};

const TYPE_BADGE_CLASSNAME: Record<string, string> = {
  Ciclovia: "border-transparent bg-[#ea5b82] text-slate-900",
  Ciclofaixa: "border-transparent bg-[#8ea3de] text-slate-900",
  Compartilhada: "border-transparent bg-[#71e391] text-slate-900",
  Ciclorrota: "border-transparent bg-[#e9cd67] text-slate-900",
};

export const segmentTypeBadgeClassName = (type: string): string => TYPE_BADGE_CLASSNAME[type] ?? "border-slate-200 bg-white text-slate-700";

export const HIERARCHY_BADGE_CLASSNAME: Record<NetworkKey, string> = {
  estrutural: "border-rose-200 bg-rose-50 text-rose-700",
  alimentadora: "border-amber-200 bg-amber-50 text-amber-700",
  local: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const NETWORK_LABEL: Record<NetworkKey, string> = {
  estrutural: NETWORK_CONFIG.estrutural.label,
  alimentadora: NETWORK_CONFIG.alimentadora.label,
  local: NETWORK_CONFIG.local.label,
};

type Option<V extends string> = { value: V; label: string };

export const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { value: "todos", label: "Status: todos" },
  { value: "avaliados", label: "Avaliados" },
  { value: "nao-avaliados", label: "Não avaliados" },
];

export const SCORE_BAND_OPTIONS: Option<ScoreBandKey | "todos">[] = [
  { value: "todos", label: "Nota: todas" },
  ...SCORE_BANDS.map((value) => ({ value, label: SCORE_BAND_LABELS[value] })),
];

export const HIERARCHY_OPTIONS: Option<NetworkKey | "todos">[] = [
  { value: "todos", label: "Hierarquia: todas" },
  ...NETWORK_KEYS.map((value) => ({ value, label: NETWORK_LABEL[value] })),
];

export const CALCULATION_OPTIONS: Option<CalculationFilter>[] = [
  { value: "todos", label: "Situação: todas" },
  { value: "validos", label: "Entram no cálculo" },
  { value: "incompativeis", label: "Incompatíveis" },
  { value: "sem-hierarquia", label: "Sem hierarquia" },
  { value: "sem-nota", label: "Sem nota" },
];

export const SORT_FIELD_OPTIONS: Option<SortField>[] = [
  { value: "displayName", label: "Ordenar: trecho" },
  { value: "typeLabel", label: "Tipologia" },
  { value: "hierarchyLabel", label: "Hierarquia" },
  { value: "status", label: "Status" },
  { value: "lengthKm", label: "Extensão" },
  { value: "score", label: "Nota" },
  { value: "contribution", label: "Contribuição" },
];

export const SORT_DIRECTION_OPTIONS: Option<SortDirection>[] = [
  { value: "asc", label: "Crescente" },
  { value: "desc", label: "Decrescente" },
];

/** The option a Select's string value stands for, without asserting its type. */
export const optionValue = <V extends string>(options: Option<V>[], value: string): V | undefined => options.find((option) => option.value === value)?.value;
