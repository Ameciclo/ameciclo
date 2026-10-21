import { CountEditionSummary } from "typings";
import { IntlNumber } from "~/services/utils";

export function useCountsStatistics(summaryData: CountEditionSummary | null) {
  if (!summaryData) {
    return [
      { title: "Total de ciclistas", value: "0" },
      { title: "Contagens Realizadas", value: "0" },
      { title: "Pontos Monitorados", value: "0" },
      { title: "Máximo em um ponto", value: "0" },
    ];
  }

  const {
    total_cyclists = 0,
    number_counts = 0,
    where_max_count = { total_cyclists: 0 },
    different_counts_points = 0,
  } = summaryData;

  return [
    { title: "Total de ciclistas", value: IntlNumber(total_cyclists) },
    { title: "Contagens Realizadas", value: IntlNumber(number_counts) },
    { title: "Pontos Monitorados", value: IntlNumber(different_counts_points) },
    { title: "Máximo em um ponto", value: IntlNumber(where_max_count.total_cyclists) },
  ];
}
