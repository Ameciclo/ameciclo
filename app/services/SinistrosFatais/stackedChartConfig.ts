import type Highcharts from "highcharts";

interface StackedChartResult {
  categories: string[];
  series: Highcharts.SeriesOptionsType[];
}

export function getStackedTransportModeData(
  citiesByYearData: any,
  selectedCity: number | null,
  tipoLocal: string = "ocorrencia"
): StackedChartResult {
  if (!citiesByYearData?.anos || citiesByYearData.anos.length === 0) {
    return { categories: [], series: [] };
  }

  const anosDisponiveis = [...citiesByYearData.anos].filter((ano: number) => ano >= 2015).sort();

  if (anosDisponiveis.length === 0) {
    return { categories: [], series: [] };
  }

  const cidadeSelecionada = selectedCity
    ? citiesByYearData.cidades?.find((c: any) => c.id === selectedCity)
    : null;

  if (!cidadeSelecionada && selectedCity) {
    return { categories: [], series: [] };
  }

  if (selectedCity && cidadeSelecionada) {
    return {
      categories: anosDisponiveis.map((ano: number) => ano.toString()),
      series: [{
        name: cidadeSelecionada.name || cidadeSelecionada.nome || "Total",
        type: "column",
        data: anosDisponiveis.map((ano: number) => cidadeSelecionada[ano.toString()] || 0),
        color: "#008888",
      }],
    };
  }

  return {
    categories: anosDisponiveis.map((ano: number) => ano.toString()),
    series: [{
      name: "RMR",
      type: "column",
      data: anosDisponiveis.map((ano: number) =>
        (citiesByYearData.cidades || []).reduce(
          (sum: number, c: any) => sum + (c[ano.toString()] || 0), 0
        )
      ),
      color: "#008888",
    }],
  };
}
