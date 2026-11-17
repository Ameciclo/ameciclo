import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import type { CyclingCityStats, CyclingHistoryPoint } from "@ameciclo/db/cycling-read";
import { km, kmValue } from "./status";

const RMR = "rmr";

const config = {
  executed: { label: "Implantado no PDC", color: "#00695f" },
} satisfies ChartConfig;

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Recife" });

/**
 * How much of the PDC is built, week after week: one point per sync with OpenStreetMap, for one
 * municipality or the whole RMR. Starts on the municipality selected in the explorer.
 */
export function ExecucaoHistory({
  history,
  cities,
  selectedIbge,
}: {
  history: CyclingHistoryPoint[];
  cities: CyclingCityStats[];
  selectedIbge: number;
}) {
  const [where, setWhere] = useState(String(selectedIbge));

  const points = history.flatMap((h) => {
    const executed = where === RMR ? h.all.executedInPdcKm : h.byCity[Number(where)]?.executedInPdcKm;
    return executed === undefined ? [] : [{ date: day(h.at), executed: Math.round(executed * 10) / 10 }];
  });
  const first = history[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Evolução</h3>
          <p className="text-sm text-gray-500">
            Quilômetros do PDC implantados, medidos toda semana.
            {first ? ` A primeira medição é de ${day(first.at)}.` : ""}
          </p>
        </div>
        <label className="text-sm text-gray-600">
          <span className="sr-only">Evolução de</span>
          <select
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800"
          >
            <option value={RMR}>Região Metropolitana</option>
            {cities.map((c) => (
              <option key={c.ibge} value={c.ibge}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {points.length < 2 ? (
        <p className="mt-4 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          {points[0] ? `Até agora temos uma medição: ${km(points[0].executed)} em ${points[0].date}. ` : ""}
          O gráfico aparece a partir da segunda medição, na próxima semana.
        </p>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <ChartContainer config={config} className="aspect-auto h-64 w-full">
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis width={48} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(v: number) => kmValue(v)} />
              <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => km(Number(v))} />} />
              <Line dataKey="executed" type="monotone" stroke="var(--color-executed)" strokeWidth={2} dot />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
