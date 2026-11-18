// Formatadores das páginas de observatório (números em português do Brasil).
export const n = (value: number) => value.toLocaleString("pt-BR");

// `part` em relação a `whole`, sem casas decimais: "29%".
export const pct = (part: number, whole: number) =>
  whole === 0 ? "0%" : `${((part / whole) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
