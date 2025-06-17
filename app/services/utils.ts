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
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export function getInicialFilters() {
  return [
    { key: "gender", value: "Masculino", checked: true },
    { key: "gender", value: "Feminino", checked: true },
    { key: "gender", value: "Outro", checked: true },
    { key: "color_race", value: "Amarela", checked: false },
    { key: "color_race", value: "Branca", checked: false },
    { key: "color_race", value: "Indígena", checked: false },
    { key: "color_race", value: "Parda", checked: false },
    { key: "color_race", value: "Preta", checked: false },
  ];
}

export function getFiltersKeys() {
  return [
    { key: "gender", title: "Gênero" },
    { key: "color_race", title: "Cor/Raça" },
  ];
}

interface HistogramData {
  title: { text: string };
  subtitle: { text: string };
  xAxis: Array<{
    title: { text: string };
    alignTicks: boolean;
    opposite?: boolean;
  }>;
  yAxis: Array<{
    title: { text: string };
    opposite?: boolean;
  }>;
  series: Array<any>;
  credits: { enabled: boolean };
}

export function getHistogramData(data: number[]): HistogramData {
  return {
    title: {
      text: "Quanto tempo você leva?",
    },
    subtitle: {
      text: "Histograma de agrupamento de distâncias em minutos",
    },
    xAxis: [
      {
        title: { text: "" },
        alignTicks: false,
      },
      {
        title: { text: "Distância em minutos" },
        alignTicks: false,
        opposite: false,
      },
    ],
    yAxis: [
      {
        title: { text: "" },
      },
      {
        title: { text: "Quantidade" },
        opposite: false,
      },
    ],
    series: [
      {
        name: "Total",
        type: "histogram",
        xAxis: 1,
        yAxis: 1,
        baseSeries: "s1",
        zIndex: 2,
      },
      {
        name: "",
        type: "scatter",
        data: data,
        visible: false,
        id: "s1",
        marker: {
          radius: 1.5,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };
}

export const IntlNumberMax1Digit = (n: number): string => IntlNumber(n, 1);

interface JsonObject {
  id?: string | number;
  name?: string;
  [key: string]: any;
}

export function filterById(jsonObject: JsonObject[], id: string | number): JsonObject | undefined {
  return jsonObject.find(item => item.id === id);
}

export function filterByName(jsonObject: JsonObject[], name: string): JsonObject | undefined {
  return jsonObject.find(item => item.name === name);
}

export const IntlNumberMin1Max3Digits = (n: number): string => IntlNumber(n, 3, 1);
export const IntlNumber3Digit = (n: number): string => IntlNumber(n, 3, 3);
export const IntlNumber2Digit = (n: number): string => IntlNumber(n, 2, 2);