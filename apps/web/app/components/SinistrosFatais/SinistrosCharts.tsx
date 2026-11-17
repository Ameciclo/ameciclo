import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import { COUNTERPARTS, MODES } from "@ameciclo/db/deaths-model";
import type { DeathStats } from "@ameciclo/db/deaths-read";
import { CID_NAMES, COUNTERPART_LABELS, MODE_COLORS, MODE_LABELS, MODE_SHORT, n, pct } from "./labels";

const modeConfig = Object.fromEntries(MODES.map((m) => [m, { label: MODE_LABELS[m], color: MODE_COLORS[m] }])) satisfies ChartConfig;

/** Mortes por ano, empilhadas por quem morreu. */
export function ModeChart({ stats }: { stats: DeathStats }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <ChartContainer config={modeConfig} className="aspect-auto h-72 w-full">
        <BarChart data={stats.byYearMode} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis width={40} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {MODES.map((m) => (
            <Bar key={m} dataKey={m} stackId="a" fill={`var(--color-${m})`} />
          ))}
        </BarChart>
      </ChartContainer>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-700">
        {MODES.map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: MODE_COLORS[m] }} />
            {MODE_SHORT[m]} <span className="tabular-nums text-gray-500">{n(stats.byMode[m])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Quem morreu, em colisão com quê: cada linha é uma vítima, cada coluna a contraparte. */
export function CollisionMatrix({ stats }: { stats: DeathStats }) {
  const rows = MODES.filter((m) => stats.byMode[m] > 0);
  const columns = COUNTERPARTS.filter((c) => rows.some((m) => stats.matrix[m][c] > 0));
  const max = Math.max(1, ...rows.flatMap((m) => columns.map((c) => stats.matrix[m][c])));
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Mortes por tipo de vítima e contraparte da colisão</caption>
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th scope="col" className="px-3 py-2 font-medium">Quem morreu</th>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-2 py-2 text-right font-medium">
                {COUNTERPART_LABELS[c]}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m} className="border-b border-gray-100 last:border-0">
              <th scope="row" className="px-3 py-2 text-left font-medium text-gray-900">{MODE_SHORT[m]}</th>
              {columns.map((c) => {
                const value = stats.matrix[m][c];
                return (
                  <td
                    key={c}
                    className="px-2 py-2 text-right tabular-nums text-gray-800"
                    style={value > 0 ? { backgroundColor: `rgba(0, 105, 95, ${0.08 + (value / max) * 0.32})` } : undefined}
                  >
                    {value > 0 ? n(value) : <span className="text-gray-300">–</span>}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900">{n(stats.byMode[m])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bars({ title, items, total }: { title: string; items: { label: string; total: number }[]; total: number }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-2 text-sm">
            <span className="truncate text-gray-700">{i.label}</span>
            <span className="h-2 rounded-full bg-gray-100">
              <span className="block h-2 rounded-full bg-ameciclo" style={{ width: `${total === 0 ? 0 : (i.total / total) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums text-gray-800">{pct(i.total, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Sexo, raça/cor e idade de quem morreu. */
export function Profile({ stats }: { stats: DeathStats }) {
  const sex = [
    { label: "Homens", total: stats.bySex.masculino },
    { label: "Mulheres", total: stats.bySex.feminino },
    ...(stats.bySex.ignorado > 0 ? [{ label: "Não informado", total: stats.bySex.ignorado }] : []),
  ];
  const aged = stats.byAge.reduce((a, b) => a + b.total, 0);
  return (
    <div className="grid gap-8 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-3">
      <Bars title="Sexo" items={sex} total={stats.total} />
      <Bars title="Raça ou cor" items={stats.byRace} total={stats.total} />
      <Bars title="Idade" items={stats.byAge} total={aged} />
    </div>
  );
}

/** Os diagnósticos mais citados nas declarações de óbito, além da causa principal. */
export function SecondaryCauses({ stats }: { stats: DeathStats }) {
  if (stats.secondaryCauses.length === 0) return null;
  const top = stats.secondaryCauses[0].total;
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white text-sm">
      {stats.secondaryCauses.map((c) => (
        <li key={c.code} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 px-4 py-2">
          <span className="font-mono text-xs text-gray-500">{c.code}</span>
          <span className="min-w-0">
            <span className="block truncate text-gray-800">{CID_NAMES[c.code] ?? CID_NAMES[c.code.slice(0, 3)] ?? "Outro diagnóstico"}</span>
            <span className="mt-1 block h-1.5 rounded-full bg-gray-100">
              <span className="block h-1.5 rounded-full bg-gray-400" style={{ width: `${(c.total / top) * 100}%` }} />
            </span>
          </span>
          <span className="text-right tabular-nums text-gray-900">{n(c.total)}</span>
        </li>
      ))}
    </ul>
  );
}
