import type { Rating } from "./persisted";

export const stripCityPrefix = (value: string, cityId: string) => (value.startsWith(`${cityId}_`) ? value.slice(cityId.length + 1) : value);

export const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const number = (min: number, max: number) => (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });

export const formatKm = number(2, 2);
export const formatIndex = number(3, 3);
export const formatCount = number(0, 0);
export const formatScore = (value: number | null) => (value === null ? "-" : number(1, 1)(value));
export const formatPercent = (value: number) => `${number(1, 1)(value)}%`;

export const getCityDetailsPath = (cityId: string) => `/detalhes-cidades/${cityId}`;

export const SCORE_BAND = {
  excellent: { label: "Excelente", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  good: { label: "Bom", className: "border-sky-200 bg-sky-50 text-sky-700" },
  fair: { label: "Regular", className: "border-amber-200 bg-amber-50 text-amber-700" },
  poor: { label: "Precisa melhorar", className: "border-rose-200 bg-rose-50 text-rose-700" },
  unavailable: { label: "Sem nota", className: "border-slate-200 bg-slate-100 text-slate-700" },
} as const;

export const getScoreBandMeta = (score: number | null) => {
  if (score === null) return SCORE_BAND.unavailable;
  if (score >= 75) return SCORE_BAND.excellent;
  if (score >= 50) return SCORE_BAND.good;
  if (score >= 25) return SCORE_BAND.fair;
  return SCORE_BAND.poor;
};

const RATING_CLASSNAMES: Record<Rating, string> = {
  A: "border-transparent bg-[#b8e5db] text-[#163b38]",
  B: "border-transparent bg-[#9fd3cb] text-[#163b38]",
  C: "border-transparent bg-[#8fafad] text-[#163b38]",
  D: "border-transparent bg-[#748987] text-white",
};

export const getRatingBadgeClassName = (rating: Rating | null) => (rating ? RATING_CLASSNAMES[rating] : SCORE_BAND.unavailable.className);

const RATING_VALUES: Record<Rating, number> = { A: 4, B: 3, C: 2, D: 1 };
export const getRatingOrderValue = (rating: Rating | null) => (rating ? RATING_VALUES[rating] : 0);

// IDECICLO index (0 to 1) as a class A to D.
export type Classification = "A" | "B" | "C" | "D";

export const getIdecicloClassification = (index: number): Classification => {
  if (index >= 1) return "A";
  if (index >= 0.7) return "B";
  if (index >= 0.4) return "C";
  return "D";
};

export const CLASSIFICATION_DESCRIPTION: Record<Classification, string> = {
  A: "Excelente",
  B: "Bom",
  C: "Regular",
  D: "Ruim",
};

const CLASSIFICATION_BADGE: Record<Classification, string> = {
  A: "border-emerald-200 bg-emerald-50 text-emerald-700",
  B: "border-sky-200 bg-sky-50 text-sky-700",
  C: "border-amber-200 bg-amber-50 text-amber-700",
  D: "border-rose-200 bg-rose-50 text-rose-700",
};

export const getCityIndexMeta = (index: number) => {
  const classification = getIdecicloClassification(index);
  return { classification, description: CLASSIFICATION_DESCRIPTION[classification], badgeClassName: CLASSIFICATION_BADGE[classification] };
};

export const SEGMENT_TYPE_COLORS: Record<string, string> = {
  Ciclovia: "#ea5b82",
  Ciclofaixa: "#8ea3de",
  Compartilhada: "#71e391",
  Ciclorrota: "#e9cd67",
};

export const getSegmentTypeBadgeClassName = (type: string) => {
  switch (type) {
    case "Ciclovia":
      return "border-transparent bg-[#ea5b82] text-slate-900";
    case "Ciclofaixa":
      return "border-transparent bg-[#8ea3de] text-slate-900";
    case "Compartilhada":
      return "border-transparent bg-[#71e391] text-slate-900";
    case "Ciclorrota":
      return "border-transparent bg-[#e9cd67] text-slate-900";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
};

export const getHierarchyBadgeClassName = (classification: string | null | undefined) => {
  if (classification === "estrutural") return "border-rose-200 bg-rose-50 text-rose-700";
  if (classification === "alimentadora") return "border-amber-200 bg-amber-50 text-amber-700";
  if (classification === "local") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
};
