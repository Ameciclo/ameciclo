import type { Classification, SegmentType } from "~/lib/osm/types";

// Same colours the original site and the ranking maps use for each typology.
export const SEGMENT_TYPE_COLOR: Record<SegmentType, string> = {
  Ciclovia: "#ea5b82",
  Ciclofaixa: "#8ea3de",
  Compartilhada: "#71e391",
  Ciclorrota: "#e9cd67",
};


export const HIERARCHY_BADGE: Record<Classification, string> = {
  estrutural: "border-rose-200 bg-rose-50 text-rose-700",
  alimentadora: "border-amber-200 bg-amber-50 text-amber-700",
  local: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
export const UNCLASSIFIED_BADGE = "border-slate-200 bg-slate-100 text-slate-600";

export const formatKm = (km: number) => km.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
