import type { PublicSeries } from "@ameciclo/db/shared";
import type { Options } from "highcharts";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { LazyChart } from "./LazyChart";

interface HourlyCyclistsChartProps {
  series: PublicSeries[];
  hours: number[];
}

export function HourlyCyclistsChart({ series, hours }: HourlyCyclistsChartProps) {
  const options: Options = {
    chart: { type: "line" },
    colors,
    tooltip: {
      headerFormat: "<b>{point.x}h</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>",
    },
    title: { text: "Fluxo horário de ciclistas" },
    xAxis: { type: "category", categories: hours.map(String), title: { text: "Hora" } },
    yAxis: { title: { text: "Quantidade" } },
    series: series.map((s) => ({ type: "line", ...s })),
    credits: { enabled: true },
  };

  return (
    <section className="container mx-auto grid grid-cols-1 auto-rows-auto gap-10 my-10">
      <div className="shadow-2xl rounded-sm p-10 text-center overflow-x-scroll">
        <div style={{ minWidth: "500px" }}>
          <h2 className="text-gray-600 text-3xl">Quantidade de ciclistas por hora</h2>
          <LazyChart options={options} />
        </div>
      </div>
    </section>
  );
}
