import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@ameciclo/ui/components/chart";
import type { CyclingHistoryPoint } from "@ameciclo/db/cycling-read";
import { IntlNumberMax1Digit } from "~/services/utils";

const RMR = "rmr";

const config = {
  executed: { label: "Implantado no PDC (km)", color: "#008080" },
} satisfies ChartConfig;

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Recife" });

/**
 * How much of the PDC is built, week after week: one point per sync with
 * OpenStreetMap, for the whole RMR or for one municipality.
 */
export function ExecucaoHistory({
  history,
  cities,
}: {
  history: CyclingHistoryPoint[];
  cities: { id: number; name: string }[];
}) {
  const [where, setWhere] = useState(RMR);

  const points = history.flatMap((h) => {
    const executed = where === RMR ? h.all.executedInPdcKm : h.byCity[Number(where)]?.executedInPdcKm;
    return executed === undefined ? [] : [{ date: day(h.at), executed: Math.round(executed * 10) / 10 }];
  });
  const first = history[0];

  return (
    <section className="mx-auto container px-4 my-12 md:my-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Evolução</h2>
            <p className="mt-2 text-gray-600">
              Medimos a infraestrutura toda semana, a partir do OpenStreetMap.
              {first ? ` A primeira medição é de ${day(first.at)}.` : ""}
            </p>
          </div>
          <label className="flex flex-col text-sm font-semibold text-gray-700">
            Onde
            <select
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              className="mt-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-normal text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-ameciclo"
            >
              <option value={RMR}>Região Metropolitana</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {points.length < 2 ? (
          <p className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
            O gráfico aparece a partir da segunda medição, na próxima semana.
          </p>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <ChartContainer config={config} className="aspect-auto h-72 w-full">
              <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis width={48} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `${IntlNumberMax1Digit(Number(v))} km`} />} />
                <Line dataKey="executed" type="monotone" stroke="var(--color-executed)" strokeWidth={2} dot />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </section>
  );
}
