export const n = (value: number) => value.toLocaleString("pt-BR");
export const pct = (part: number, whole: number) =>
  whole === 0 ? "0%" : `${((part / whole) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
export const km = (value: number | null) => (value === null ? "–" : value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
export const perKm = (value: number | null) => (value === null ? "–" : value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }));
