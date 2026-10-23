export type WayStatus =
  | "pdc_realizado_designado"
  | "pdc_realizado_nao_designado"
  | "realizado_fora_pdc"
  | "pdc_nao_realizado";

export const STATUS: Record<WayStatus, { label: string; hint: string; color: string }> = {
  pdc_realizado_designado: {
    label: "Executado como planejado",
    hint: "Existe e tem a tipologia prevista no PDC",
    color: "#16a34a",
  },
  pdc_realizado_nao_designado: {
    label: "Executado, tipologia diferente",
    hint: "Existe, mas com tipologia diferente da prevista no PDC",
    color: "#ca8a04",
  },
  realizado_fora_pdc: { label: "Fora do plano", hint: "Existe e não faz parte de nenhum projeto do PDC", color: "#2563eb" },
  pdc_nao_realizado: { label: "Previsto, não executado", hint: "Previsto no PDC e ainda sem ciclovia", color: "#dc2626" },
};

export const STATUS_ORDER: WayStatus[] = [
  "pdc_realizado_designado",
  "pdc_realizado_nao_designado",
  "realizado_fora_pdc",
  "pdc_nao_realizado",
];

export function isWayStatus(value: string | null): value is WayStatus {
  return value !== null && value in STATUS;
}

export const STAGE_LABEL = {
  existing: "Existente",
  proposed: "Proposto",
  planned: "Planejado",
} as const;

export type Stage = keyof typeof STAGE_LABEL;

export const STAGES = Object.keys(STAGE_LABEL) as Stage[];

export function formatKm(value: number | null | undefined): string {
  return value === null || value === undefined
    ? "—"
    : value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
