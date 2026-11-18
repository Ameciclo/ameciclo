import type { PublicCount } from "@ameciclo/db/shared";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@ameciclo/ui/components/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { countNote } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";

const config = { total: { label: "Ciclistas", color: colors[0] } } satisfies ChartConfig;

// Total cyclists of every count at a place, oldest first, so changes over the years are visible.
export function EvolutionChart({ counts, selectedId }: { counts: PublicCount[]; selectedId: number }) {
  const ordered = [...counts].sort((a, b) => a.date.localeCompare(b.date));
  const rows = ordered.map((c) => ({
    label: c.variant ? `${IntlDateStr(c.date)} · ${c.variant}` : IntlDateStr(c.date),
    total: c.total_cyclists,
    note: countNote(c),
    selected: c.id === selectedId,
  }));

  return (
    <section className="container mx-auto grid grid-cols-1 gap-10 my-10">
      <div className="shadow-2xl rounded-sm p-10 text-center overflow-x-auto">
        <div style={{ minWidth: "500px" }}>
          <h2 className="text-gray-600 text-3xl">Evolução ao longo dos anos</h2>
          <ChartContainer config={config} className="aspect-auto mt-6 h-96 w-full">
            <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis width={56} tickLine={false} axisLine={false} tickFormatter={(v: number) => IntlNumber(v)} label={{ value: "Ciclistas", angle: -90, position: "insideLeft" }} />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  const row = active ? payload?.[0]?.payload : undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium">{row.label}</p>
                      <p>
                        {IntlNumber(row.total)} ciclistas{row.note ? ` (${row.note.toLowerCase()})` : ""}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" radius={3}>
                {rows.map((row) => (
                  // The count being viewed stands out; estimated and partial ones are lighter.
                  <Cell key={row.label} fill={row.selected ? colors[0] : "#9ca3af"} fillOpacity={row.note ? 0.6 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </section>
  );
}
