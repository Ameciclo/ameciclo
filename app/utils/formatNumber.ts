export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(1).replace('.0', '')}\u00A0mi`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(1).replace('.0', '')}\u00A0mil`;
  }
  return value.toLocaleString("pt-BR");
}

export function formatCompactParts(value: number | null | undefined): { value: string; suffix: string } {
  if (value == null) return { value: "—", suffix: "" };
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return { value: millions.toFixed(1).replace('.0', ''), suffix: "mi" };
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return { value: thousands.toFixed(1).replace('.0', ''), suffix: "mil" };
  }
  return { value: value.toLocaleString("pt-BR"), suffix: "" };
}

export function formatFullNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR");
}
