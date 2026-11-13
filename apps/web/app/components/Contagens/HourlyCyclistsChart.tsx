import type { PublicSeries } from "@ameciclo/db/shared";
import type { Options } from "highcharts";
import type { ReactNode } from "react";
import { colors as defaultColors } from "~/components/Charts/FlowChart/FlowContainer";
import { LazyChart } from "./LazyChart";

interface HourlyCyclistsChartProps {
  series: PublicSeries[];
  hours: number[];
  // Defaults suit one or two series; a comparison passes its own palette.
  colors?: string[];
  // For series that are not counts, e.g. shares of the day in percent.
  unit?: { yTitle: string; suffix: string; decimals: number };
  // Extra controls shown between the heading and the chart.
  controls?: ReactNode;
}

export function HourlyCyclistsChart({ series, hours, colors = defaultColors, unit, controls }: HourlyCyclistsChartProps) {
  const options: Options = {
    chart: { type: "line" },
    colors,
    tooltip: {
      headerFormat: "<b>{point.x}h</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>",
      valueDecimals: unit?.decimals,
      valueSuffix: unit?.suffix,
    },
    title: { text: "Fluxo horário de ciclistas" },
    xAxis: { type: "category", categories: hours.map(String), title: { text: "Hora" } },
    yAxis: { title: { text: unit?.yTitle ?? "Quantidade" } },
    series: series.map((s) => ({ type: "line", ...s })),
    credits: { enabled: true },
  };

  return (
    <section className="container mx-auto grid grid-cols-1 auto-rows-auto gap-10 my-10">
      <div className="shadow-2xl rounded-sm p-10 text-center overflow-x-scroll">
        <div style={{ minWidth: "500px" }}>
          <h2 className="text-gray-600 text-3xl">Quantidade de ciclistas por hora</h2>
          {controls}
          <LazyChart options={options} />
        </div>
      </div>
    </section>
  );
}
