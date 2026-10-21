/**
 * Formata valores monetários para exibição simplificada
 * @param value Valor numérico
 * @returns String formatada (ex: "26 Bi", "1.5 Mi", "R$ 1.390,25")
 */
export function formatLargeValue(value: number): string {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `R$ ${billions.toFixed(1).replace('.0', '')} Bi`;
  } else if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `R$ ${millions.toFixed(1).replace('.0', '')} Mi`;
  } else {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}