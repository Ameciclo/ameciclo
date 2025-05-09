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

export function getHistogramData(data: any) {
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

export const IntlNumberMax1Digit = (n: any) => IntlNumber(n, 1);
