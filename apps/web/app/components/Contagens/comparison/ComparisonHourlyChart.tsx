import type { PublicCountDetail } from "@ameciclo/db/shared";
import { useState } from "react";
import { Checkbox } from "@ameciclo/ui/components/checkbox";
import { Label } from "@ameciclo/ui/components/label";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { colorAt } from "./constants";

export type ChartCount = { label: string; detail: PublicCountDetail };

// One value per hour of the union of all counts' hours; hours a count lacks are zero.
// With `share`, each value is that hour's part of the count's own day (in percent), which
// compares the shape of the day between counts of very different volume.
export function hourlySeries(counts: readonly ChartCount[], metricIndex: number, share: boolean) {
  const hours = [...new Set(counts.flatMap(({ detail }) => detail.hours))].sort((a, b) => a - b);
  const series = counts.map(({ label, detail }) => {
    const data = detail.series[metricIndex]?.data ?? [];
    const dayTotal = data.reduce((sum, v) => sum + v, 0);
    return {
      name: label,
      data: hours.map((h) => {
        const value = data[detail.hours.indexOf(h)] ?? 0;
        return share ? (dayTotal > 0 ? (value / dayTotal) * 100 : 0) : value;
      }),
    };
  });
  return { hours, series };
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-foreground hover:border-primary hover:text-primary"}`;

// Hourly chart of the counts side by side, for one metric at a time (all counts share the
// same list of series: the total, then each characteristic).
export function ComparisonHourlyChart({ counts }: { counts: readonly ChartCount[] }) {
  const [metricIndex, setMetricIndex] = useState(0);
  const [share, setShare] = useState(false);

  const metrics = counts[0]?.detail.series.map((s) => s.name) ?? [];
  const { hours, series } = hourlySeries(counts, metricIndex, share);

  const controls = (
    <div className="my-4 flex flex-col gap-3 text-left">
      <div role="group" aria-label="Métrica do gráfico" className="flex flex-wrap gap-2">
        {metrics.map((name, index) => (
          <button key={name} type="button" aria-pressed={index === metricIndex} onClick={() => setMetricIndex(index)} className={chip(index === metricIndex)}>
            {name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="grafico-share" checked={share} onCheckedChange={(checked) => setShare(checked === true)} />
        <Label htmlFor="grafico-share" className="cursor-pointer text-sm font-normal">
          Mostrar como % do total do dia (compara o formato do dia, não o volume)
        </Label>
      </div>
    </div>
  );

  return (
    <HourlyCyclistsChart
      series={series}
      hours={hours}
      colors={counts.map((_, i) => colorAt(i).hex)}
      unit={share ? { yTitle: "% do total do dia", suffix: "%", decimals: 1 } : undefined}
      controls={controls}
    />
  );
}
