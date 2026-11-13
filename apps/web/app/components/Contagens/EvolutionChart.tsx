import type { PublicCount } from "@ameciclo/db/shared";
import { ClientOnly } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@ameciclo/ui/components/chart";
import { countNote } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";

type Point = { label: string; total: number; note: string | null; current: boolean };

const config: ChartConfig = { total: { label: "Ciclistas", color: "#008080" } };

function EvolutionTooltip({ active, label, points }: { active?: boolean; label?: string | number; points: Point[] }) {
  const point = points.find((p) => p.label === label);
  if (!active || !point) return null;
  return (
    <div className="grid gap-1 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{point.label}</div>
      <div>
        <span className="font-mono text-sm font-semibold tabular-nums">{IntlNumber(point.total)}</span> ciclistas
      </div>
      {point.note && <div className="text-amber-800">Contagem {point.note.toLowerCase()}</div>}
      {point.current && <div className="text-muted-foreground">Contagem aberta nesta página</div>}
    </div>
  );
}

// Total cyclists of every count at a place, oldest first, so changes over the years are visible.
// The count on screen is teal, the others muted; estimated and partial ones are lighter.
export function EvolutionChart({ counts, selectedId }: { counts: PublicCount[]; selectedId: number }) {
  const ordered = [...counts].sort((a, b) => a.date.localeCompare(b.date));
  const points: Point[] = ordered.map((c) => ({
    label: c.variant ? `${IntlDateStr(c.date)} · ${c.variant}` : IntlDateStr(c.date),
    total: c.total_cyclists,
    note: countNote(c),
    current: c.id === selectedId,
  }));
  const summary = `Gráfico de barras com o total de ciclistas de cada contagem deste local, de ${points[0]?.label} a ${points[points.length - 1]?.label}.`;

  return (
    <section className="container mx-auto px-4 pb-10" aria-labelledby="grafico-evolucao">
      <div className="rounded-xl border bg-card p-5 shadow-sm md:p-8">
        <h2 id="grafico-evolucao" className="text-2xl font-bold">
          Evolução ao longo dos anos
        </h2>
        <figure className="mt-4" aria-label={summary}>
          <ClientOnly fallback={<div className="h-72 w-full" />}>
            <ChartContainer config={config} className="aspect-auto h-72 w-full">
              <BarChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 8 }} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} tickMargin={8} />
                <YAxis
                  width={56}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => IntlNumber(value)}
                  label={{ value: "ciclistas", angle: -90, position: "insideLeft", offset: 4, style: { textAnchor: "middle" } }}
                />
                <ChartTooltip cursor={{ fill: "var(--accent)" }} content={<EvolutionTooltip points={points} />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {points.map((p) => (
                    <Cell key={p.label} fill={p.current ? "var(--color-total)" : "#9bb5b5"} fillOpacity={p.note ? 0.6 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </ClientOnly>
          <figcaption className="sr-only">{summary}</figcaption>
        </figure>
        <ul className="sr-only">
          {points.map((p) => (
            <li key={p.label}>
              {p.label}: {IntlNumber(p.total)} ciclistas{p.note ? ` (${p.note.toLowerCase()})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
