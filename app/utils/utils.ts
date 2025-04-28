export const IntlNumber = (n: any, max = 3, min = 0) => {
  const INumber = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: max,
    minimumFractionDigits: min,
  }).format(n);
  return INumber;
};

export const IntlPercentil = (n: any) => {
  const INumber = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
  }).format(n);
  return INumber
};

export const IntlDateStr = (str: string) => {
  const date = new Date(str);
  const IDate = new Intl.DateTimeFormat("pt-BR").format(date);
  return IDate
};