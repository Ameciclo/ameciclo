import type { PublicSeries } from "@ameciclo/db/shared";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import { useState, type ReactNode } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { colors as defaultColors } from "~/components/Charts/FlowChart/FlowContainer";

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
  // Series the page marks as hidden start hidden; clicking a legend entry shows or hides it.
  // Series are keyed by position (`s0`, `s1`...): their names can hold spaces and symbols that are not valid in CSS variables.
  const [hidden, setHidden] = useState(() => new Set(series.flatMap((s, i) => (s.visible === false ? [`s${i}`] : []))));

  const config: ChartConfig = Object.fromEntries(series.map((s, i) => [`s${i}`, { label: s.name, color: colors[i % colors.length] }]));
  const rows = hours.map((hour, i) => ({ hour: `${hour}h`, ...Object.fromEntries(series.map((s, j) => [`s${j}`, s.data[i]])) }));
  const format = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: unit?.decimals ?? 0 }) + (unit?.suffix ?? "");

  return (
    <section className="container mx-auto grid grid-cols-1 auto-rows-auto gap-10 my-10">
      <div className="shadow-2xl rounded-sm p-10 text-center overflow-x-auto">
        <div style={{ minWidth: "500px" }}>
          <h2 className="text-gray-600 text-3xl">Quantidade de ciclistas por hora</h2>
          {controls}
          <ChartContainer config={config} className="aspect-auto mt-6 h-96 w-full">
            <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} label={{ value: "Hora", position: "insideBottom", offset: -4 }} />
              <YAxis width={56} tickLine={false} axisLine={false} tickFormatter={(v: number) => format(v)} label={{ value: unit?.yTitle ?? "Quantidade", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => format(Number(v))} />} />
              <Legend
                wrapperStyle={{ cursor: "pointer" }}
                onClick={(entry) => {
                  const name = String(entry.dataKey);
                  setHidden((prev) => {
                    const next = new Set(prev);
                    if (!next.delete(name)) next.add(name);
                    return next;
                  });
                }}
              />
              {series.map((s, i) => (
                <Line key={`s${i}`} dataKey={`s${i}`} name={s.name} stroke={`var(--color-s${i})`} strokeWidth={2} dot={false} hide={hidden.has(`s${i}`)} />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </section>
  );
}
