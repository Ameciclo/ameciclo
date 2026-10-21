const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toLocaleString("pt-BR");
}

export function hourLabel(startHour: number, bucket: number, bucketMinutes: number): string {
  const minutes = startHour * 60 + bucket * bucketMinutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export const TOPOLOGY_LABEL: Record<string, string> = {
  point: "Ponto",
  t_junction: "Junção em T",
  crossroad: "Cruzamento",
};
