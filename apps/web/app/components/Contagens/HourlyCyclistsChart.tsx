import type { PublicSeries } from "@ameciclo/db/shared";
import { ClientOnly } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@ameciclo/ui/components/chart";
import { cn } from "@ameciclo/ui/lib/utils";

// Brand teal first, then colors that stay apart from it. A comparison passes its own palette.
const DEFAULT_COLORS = ["#008080", "#E69F00", "#0072B2", "#CC79A7", "#7C3AED", "#D55E00", "#56B4E9", "#009E73", "#6B7280", "#B45309"];

type HourlyCyclistsChartProps = {
  series: PublicSeries[];
  hours: number[];
  colors?: string[];
  // For series that are not counts, e.g. shares of the day in percent.
  unit?: { yTitle: string; suffix: string; decimals: number };
  // Extra controls shown between the heading and the chart.
  controls?: ReactNode;
};

const CHART_HEIGHT = "h-80";

const placeholder = (
  <div className={cn(CHART_HEIGHT, "flex w-full items-center justify-center text-sm text-muted-foreground")}>Carregando gráfico...</div>
);

// Cyclists per hour: one line per series, toggled from the legend buttons.
export function HourlyCyclistsChart({ series, hours, colors = DEFAULT_COLORS, unit, controls }: HourlyCyclistsChartProps) {
  const keyed = series.map((s, i) => ({ ...s, key: `s${i}`, color: colors[i % colors.length] }));
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(keyed.filter((s) => s.visible === false).map((s) => s.key)));

  const config: ChartConfig = Object.fromEntries(keyed.map((s) => [s.key, { label: s.name, color: s.color }]));
  const data = hours.map((hour, i) => ({
    hour: `${hour}h`,
    ...Object.fromEntries(keyed.map((s) => [s.key, s.data[i] ?? 0])),
  }));
  const format = (value: number) =>
    unit ? `${value.toLocaleString("pt-BR", { minimumFractionDigits: unit.decimals, maximumFractionDigits: unit.decimals })}${unit.suffix}` : value.toLocaleString("pt-BR");
  const summary = `Gráfico de linhas com a quantidade de ciclistas por hora, das ${hours[0]}h às ${hours[hours.length - 1]}h, para ${keyed.length} ${keyed.length === 1 ? "série" : "séries"}.`;

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section className="container mx-auto px-4 pb-10" aria-labelledby="grafico-horario">
      <div className="rounded-xl border bg-card p-5 shadow-sm md:p-8">
        <h2 id="grafico-horario" className="text-2xl font-bold">
          Quantidade de ciclistas por hora
        </h2>
        {controls}

        <div role="group" aria-label="Séries do gráfico" className="my-4 flex flex-wrap gap-2">
          {keyed.map((s) => {
            const on = !hidden.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.key)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  on ? "border-input bg-background text-foreground" : "border-transparent bg-muted text-muted-foreground line-through",
                )}
              >
                <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: on ? s.color : "transparent", border: `2px solid ${s.color}` }} />
                {s.name}
              </button>
            );
          })}
        </div>

        <figure aria-label={summary}>
          <ClientOnly fallback={placeholder}>
            <ChartContainer config={config} className={cn(CHART_HEIGHT, "aspect-auto w-full")}>
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: 8 }} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="hour" tickLine={false} tickMargin={8} label={{ value: "Hora do dia (h)", position: "insideBottom", offset: -12 }} />
                <YAxis
                  width={56}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => format(value)}
                  label={{ value: unit?.yTitle ?? "ciclistas", angle: -90, position: "insideLeft", offset: 4, style: { textAnchor: "middle" } }}
                />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={format} />} />
                {keyed.map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    type="monotone"
                    stroke={`var(--color-${s.key})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    hide={hidden.has(s.key)}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </ClientOnly>
          <figcaption className="sr-only">{summary}</figcaption>
        </figure>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-primary">Ver os valores em tabela</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Hora
                  </th>
                  {keyed.map((s) => (
                    <th key={s.key} scope="col" className="px-3 py-2 font-medium">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, i) => (
                  <tr key={hour} className="border-b last:border-0">
                    <th scope="row" className="py-1.5 pr-4 font-normal">
                      {hour}h
                    </th>
                    {keyed.map((s) => (
                      <td key={s.key} className="px-3 py-1.5 tabular-nums">
                        {format(s.data[i] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
