import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@ameciclo/ui/components/chart";

type Series = { name: string; values: Map<number, number | null> };

type EvolutionChartProps = {
  a: Series;
  b?: Series;
  format: (value: number | null) => string;
};

// One indicator over the survey years, for one city or two side by side.
// The y axis starts at zero so a small change does not look like a big one.
export function EvolutionChart({ a, b, format }: EvolutionChartProps) {
  const years = [...new Set([...a.values.keys(), ...(b?.values.keys() ?? [])])].sort((x, y) => x - y);
  const data = years.map((year) => ({
    year: String(year),
    a: a.values.get(year) ?? null,
    b: b?.values.get(year) ?? null,
  }));

  const config: ChartConfig = {
    a: { label: a.name, color: "var(--chart-1)" },
    ...(b ? { b: { label: b.name, color: "var(--chart-2)" } } : {}),
  };

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          width={48}
          tickLine={false}
          axisLine={false}
          domain={[0, "auto"]}
          tickFormatter={(v: number) => format(v)}
        />
        <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => format(v)} />} />
        {b && <ChartLegend content={<ChartLegendContent />} />}
        <Line dataKey="a" type="monotone" stroke="var(--color-a)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
        {b && <Line dataKey="b" type="monotone" stroke="var(--color-b)" strokeWidth={2} dot={{ r: 4 }} connectNulls />}
      </LineChart>
    </ChartContainer>
  );
}
