import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import type { StreetCategoryRow, UnsafeStreetsYear } from "@ameciclo/db";
import type { ConcentrationPoint } from "@ameciclo/db/streets-model";
import { isPartialYear } from "~/queries/dados.vias-inseguras";
import { n, pct } from "./labels";

const concentrationConfig = { share: { label: "Chamados acumulados", color: "#bd0026" } } satisfies ChartConfig;
const yearConfig = { calls: { label: "Chamados com atendimento", color: "#008080" } } satisfies ChartConfig;

// Quanto dos chamados com via identificada cabe nas primeiras vias do ranking (ou nos primeiros quilômetros): a curva
// sobe rápido porque poucas vias, e poucos quilômetros, concentram muito.
export function ConcentrationChart({ points, axis }: { points: ConcentrationPoint[]; axis: "vias" | "km" }) {
  const data = points.map((p) => ({ x: axis === "vias" ? p.vias : Math.round(p.km * 10) / 10, share: Math.round(p.share * 10) / 10 }));
  const unit = axis === "vias" ? "vias" : "km";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <ChartContainer config={concentrationConfig} className="aspect-auto h-64 w-full">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} type="number" domain={[0, "dataMax"]} unit={axis === "km" ? " km" : ""} />
          <YAxis width={44} tickLine={false} axisLine={false} domain={[0, "dataMax"]} tickFormatter={(v: number) => `${Math.round(v)}%`} />
          <ChartTooltip
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload;
              if (!active || !point) return null;
              return (
                <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow">
                  {axis === "vias" ? `As ${point.x} primeiras vias` : `Os primeiros ${point.x.toLocaleString("pt-BR")} km`} reúnem{" "}
                  <span className="font-semibold tabular-nums">{point.share.toLocaleString("pt-BR")}%</span> dos chamados
                </div>
              );
            }}
          />
          <Area dataKey="share" type="monotone" stroke="var(--color-share)" fill="var(--color-share)" fillOpacity={0.15} />
        </AreaChart>
      </ChartContainer>
      <p className="mt-2 text-xs text-gray-500">
        Eixo horizontal: {axis === "vias" ? "quantas vias, da mais para a menos insegura" : "quilômetros de via somados, da mais para a menos insegura (só vias com extensão na malha da Prefeitura)"}. Eixo vertical: parte dos
        chamados com via identificada que {unit === "vias" ? "elas reúnem" : "elas reúnem"}.
      </p>
    </div>
  );
}

export function YearBars({ years }: { years: UnsafeStreetsYear[] }) {
  const partial = years.filter(isPartialYear);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <ChartContainer config={yearConfig} className="aspect-auto h-60 w-full">
        <BarChart data={years.map((y) => ({ ...y, label: isPartialYear(y) ? `${y.year}*` : String(y.year) }))} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis width={40} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="calls">
            {years.map((y) => (
              <Cell key={y.year} fill={isPartialYear(y) ? "#99cccc" : "var(--color-calls)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      {partial.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          * A fonte do SAMU não tem todos os meses de {partial.map((y) => `${y.year} (${y.months} ${y.months === 1 ? "mês" : "meses"})`).join(", ")}: essas barras, em tom claro, têm menos chamados do que houve e não servem para comparar com os outros anos.
        </p>
      )}
    </div>
  );
}

export function CategoryBars({ categories }: { categories: StreetCategoryRow[] }) {
  const total = categories.reduce((sum, c) => sum + c.calls, 0);
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.category}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-800">{c.category}</span>
            <span className="tabular-nums text-gray-600">{n(c.calls)} · {pct(c.calls, total)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-ameciclo" style={{ width: `${total > 0 ? (c.calls / total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
