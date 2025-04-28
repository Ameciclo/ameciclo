export const IntlNumber = (n: any, max = 3, min = 0) => {
  const INumber = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: max,
    minimumFractionDigits: min,
  }).format(n);
  return INumber;
};