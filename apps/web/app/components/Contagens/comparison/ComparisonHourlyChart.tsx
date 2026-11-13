import type { PublicCountDetail } from "@ameciclo/db/shared";
import { useState } from "react";
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
  `rounded-full border px-3 py-1 text-sm transition-colors ${active ? "border-ameciclo bg-ameciclo text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`;

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
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" className="h-4 w-4 accent-ameciclo" checked={share} onChange={(e) => setShare(e.target.checked)} />
        Mostrar como % do total do dia (compara o formato do dia, não o volume)
      </label>
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
