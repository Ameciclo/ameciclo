import type { PublicSeries } from "@ameciclo/db/shared";
import type { Options } from "highcharts";
import type { ReactNode } from "react";
import { colors as defaultColors } from "~/components/Charts/FlowChart/FlowContainer";
import { LazyChart } from "./LazyChart";

const BRAND_FIRST = ["#008080", ...defaultColors.slice(1)];

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

export function HourlyCyclistsChart({ series, hours, colors = BRAND_FIRST, unit, controls }: HourlyCyclistsChartProps) {
  const options: Options = {
    chart: { type: "line" },
    colors,
    tooltip: {
      headerFormat: "<b>{point.x}h</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>",
      valueDecimals: unit?.decimals,
      valueSuffix: unit?.suffix,
    },
    title: { text: undefined },
    xAxis: { type: "category", categories: hours.map(String), title: { text: "Hora" } },
    yAxis: { title: { text: unit?.yTitle ?? "Quantidade" } },
    series: series.map((s) => ({ type: "line", ...s })),
    credits: { enabled: true },
  };

  return (
    <section className="container mx-auto px-4 pb-10" aria-labelledby="grafico-horario">
      <div className="overflow-x-auto rounded-xl border bg-card p-5 shadow-sm md:p-8">
        <div className="min-w-[500px]">
          <h2 id="grafico-horario" className="text-2xl font-bold">
            Quantidade de ciclistas por hora
          </h2>
          {controls}
          <LazyChart options={options} />
        </div>
      </div>
    </section>
  );
}
