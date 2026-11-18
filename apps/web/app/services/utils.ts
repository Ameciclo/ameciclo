export const IntlNumber = (n: number, max = 3, min = 0): string => {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: max,
    minimumFractionDigits: min,
  }).format(n);
};

export const IntlPercentil = (n: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
  }).format(n);
};

export const IntlDateStr = (str: string): string => {
  const date = new Date(str);
  // A date without a time is UTC midnight; formatting it in the local zone would show the previous day.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
  return new Intl.DateTimeFormat("pt-BR", dateOnly ? { timeZone: "UTC" } : undefined).format(date);
};

export const IntlNumberMax1Digit = (n: number): string => IntlNumber(n, 1);

export function filterById<T extends { id?: string | number }>(items: T[], id: string | number): T | undefined {
  return items.find((item) => item.id === id);
}

export function filterByName<T extends { name?: string }>(items: T[], name: string): T | undefined {
  return items.find((item) => item.name === name);
}

export const IntlNumberMin1Max3Digits = (n: number): string => IntlNumber(n, 3, 1);
export const IntlNumber3Digit = (n: number): string => IntlNumber(n, 3, 3);
