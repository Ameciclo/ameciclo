export { n, pct } from "../Observatorio/format";
export const km = (value: number | null) => (value === null ? "–" : value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
export const perKm = (value: number | null) => (value === null ? "–" : value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }));
