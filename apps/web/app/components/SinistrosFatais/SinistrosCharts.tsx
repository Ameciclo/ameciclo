import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import { COUNTERPARTS, MODES, type Counterpart, type Mode } from "@ameciclo/db/deaths-model";
import type { DeathStats, Profile } from "@ameciclo/db/deaths-read";
import { CID_NAMES, COUNTERPART_LABELS, MODE_COLORS, MODE_LABELS, MODE_SHORT, n, pct } from "./labels";

const modeConfig = Object.fromEntries(MODES.map((m) => [m, { label: MODE_LABELS[m], color: MODE_COLORS[m] }])) satisfies ChartConfig;

const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
    on ? "border-gray-300 bg-white text-gray-900 hover:bg-gray-50" : "border-dashed border-gray-300 bg-transparent text-gray-400 hover:text-gray-600"
  }`;

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

/** Mortes por ano, empilhadas por quem morreu. Cada tipo de vítima da legenda liga e desliga. */
export function ModeChart({ stats, partialYears }: { stats: DeathStats; partialYears: number[] }) {
  const [hidden, setHidden] = useState<Mode[]>([]);
  const shown = MODES.filter((m) => !hidden.includes(m));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <ChartContainer config={modeConfig} className="aspect-auto h-72 w-full">
        <BarChart data={stats.byYearMode} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(y: number) => (partialYears.includes(y) ? `${y}*` : String(y))} />
          <YAxis width={40} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {shown.map((m) => (
            <Bar key={m} dataKey={m} stackId="a" fill={`var(--color-${m})`} />
          ))}
        </BarChart>
      </ChartContainer>
      <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Quem aparece no gráfico">
        {MODES.map((m) => {
          const on = !hidden.includes(m);
          return (
            <li key={m}>
              <button
                type="button"
                aria-pressed={on}
                // Pelo menos um tipo de vítima fica no gráfico.
                disabled={on && shown.length === 1}
                onClick={() => setHidden((prev) => toggle(prev, m))}
                className={`${chip(on)} disabled:cursor-not-allowed`}
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={on ? { backgroundColor: MODE_COLORS[m] } : { boxShadow: `inset 0 0 0 1.5px ${MODE_COLORS[m]}` }} />
                {MODE_SHORT[m]} <span className="tabular-nums text-gray-500">{n(stats.byMode[m])}</span>
              </button>
            </li>
          );
        })}
        {hidden.length > 0 && (
          <li>
            <button type="button" onClick={() => setHidden([])} className="text-xs text-ameciclo underline underline-offset-2">
              Mostrar todos
            </button>
          </li>
        )}
      </ul>
      {stats.byYear.some((y) => partialYears.includes(y.year)) && <p className="mt-2 text-xs text-gray-500">* Ano ainda não fechado no SIM: tem menos mortes do que terá.</p>}
    </div>
  );
}

// Colisões sem uma outra parte identificada: confundem a leitura geral, então começam escondidas.
const HIDDEN_AT_FIRST: Counterpart[] = ["objeto_fixo", "sem_colisao", "nao_especificado"];

/** Quem morreu, em colisão com quê: cada linha é uma vítima, cada coluna a contraparte. */
export function CollisionMatrix({ stats }: { stats: DeathStats }) {
  const [hidden, setHidden] = useState<Counterpart[]>(HIDDEN_AT_FIRST);
  const [percent, setPercent] = useState(false);

  const rows = MODES.filter((m) => stats.byMode[m] > 0);
  const available = COUNTERPARTS.filter((c) => rows.some((m) => stats.matrix[m][c] > 0));
  const columns = available.filter((c) => !hidden.includes(c));
  const rowTotal = (m: Mode) => columns.reduce((sum, c) => sum + stats.matrix[m][c], 0);
  const columnTotal = (c: Counterpart) => rows.reduce((sum, m) => sum + stats.matrix[m][c], 0);
  const grand = rows.reduce((sum, m) => sum + rowTotal(m), 0);
  const max = Math.max(1, ...rows.flatMap((m) => columns.map((c) => stats.matrix[m][c])));
  const show = (value: number) =>
    percent ? `${((value / (grand || 1)) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : n(value);
  const left = stats.total - grand;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <ul className="flex flex-wrap items-center gap-2" aria-label="Colunas da tabela">
          {available.map((c) => {
            const on = !hidden.includes(c);
            return (
              <li key={c}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={on && columns.length === 1}
                  onClick={() => setHidden((prev) => toggle(prev, c))}
                  className={`${chip(on)} disabled:cursor-not-allowed`}
                >
                  {COUNTERPART_LABELS[c]}
                </button>
              </li>
            );
          })}
        </ul>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={percent} onChange={(e) => setPercent(e.target.checked)} className="accent-ameciclo" />
          Mostrar em percentual
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
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
              <tr key={m} className="border-b border-gray-100">
                <th scope="row" className="px-3 py-2 text-left font-medium text-gray-900">{MODE_SHORT[m]}</th>
                {columns.map((c) => {
                  const value = stats.matrix[m][c];
                  return (
                    <td
                      key={c}
                      className="px-2 py-2 text-right tabular-nums text-gray-800"
                      style={value > 0 ? { backgroundColor: `rgba(0, 105, 95, ${0.08 + (value / max) * 0.32})` } : undefined}
                    >
                      {value > 0 ? show(value) : <span className="text-gray-300">–</span>}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900">{show(rowTotal(m))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-300 bg-gray-50">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-gray-900">
                Total <span className="font-normal text-gray-500">(a outra parte)</span>
              </th>
              {columns.map((c) => (
                <td key={c} className="px-2 py-2 text-right font-semibold tabular-nums text-gray-900">{show(columnTotal(c))}</td>
              ))}
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900">{show(grand)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Cada linha é quem morreu; cada coluna, contra quem ou o quê. A última linha soma quantas mortes tiveram aquela parte do outro lado da colisão,
        por exemplo quantas pessoas morreram em colisões com um ciclista.
        {left > 0 && ` Totais e percentuais só consideram o que está à mostra; ${n(left)} ${left === 1 ? "morte está" : "mortes estão"} nas colunas escondidas.`}
      </p>
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

/** Sexo, raça/cor e idade. */
export function ProfileBars({ profile }: { profile: Profile }) {
  const sex = [
    { label: "Homens", total: profile.bySex.masculino },
    { label: "Mulheres", total: profile.bySex.feminino },
    ...(profile.bySex.ignorado > 0 ? [{ label: "Não informado", total: profile.bySex.ignorado }] : []),
  ];
  const aged = profile.byAge.reduce((a, b) => a + b.total, 0);
  return (
    <div className="grid gap-8 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-3">
      <Bars title="Sexo" items={sex} total={profile.total} />
      <Bars title="Raça ou cor" items={profile.byRace} total={profile.total} />
      <Bars title="Idade" items={profile.byAge} total={aged} />
    </div>
  );
}

/** Os diagnósticos mais citados nas declarações de óbito, além da causa principal. */
export function SecondaryCauses({ profile }: { profile: Profile }) {
  if (profile.secondaryCauses.length === 0) return null;
  const top = profile.secondaryCauses[0].total;
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white text-sm">
      {profile.secondaryCauses.map((c) => (
        <li key={c.code} className="grid grid-cols-[3rem_1fr_3.5rem_3rem] items-center gap-3 px-4 py-2">
          <span className="font-mono text-xs text-gray-500">{c.code}</span>
          <span className="min-w-0">
            <span className="block truncate text-gray-800">{CID_NAMES[c.code] ?? "Outro diagnóstico"}</span>
            <span className="mt-1 block h-1.5 rounded-full bg-gray-100">
              <span className="block h-1.5 rounded-full bg-gray-400" style={{ width: `${(c.total / top) * 100}%` }} />
            </span>
          </span>
          <span className="text-right tabular-nums text-gray-900">{n(c.total)}</span>
          <span className="text-right tabular-nums text-gray-500">{pct(c.total, profile.total)}</span>
        </li>
      ))}
    </ul>
  );
}

const FEW_CASES = 30;

/** Perfil e diagnósticos, de todas as vítimas ou de um tipo só: o perfil do ciclista morto, do pedestre... */
export function VictimProfile({ stats }: { stats: DeathStats }) {
  const [victim, setVictim] = useState<Mode | "todos">("todos");
  const options = MODES.filter((m) => stats.byVictim[m].total > 0);
  // Um filtro novo pode deixar o tipo escolhido sem nenhuma morte: volta para todos.
  const active = victim !== "todos" && stats.byVictim[victim].total > 0 ? victim : "todos";
  const profile = active === "todos" ? stats : stats.byVictim[active];
  const who = active === "todos" ? "pessoas" : MODE_LABELS[active].toLowerCase();
  const choices: (Mode | "todos")[] = ["todos", ...options];

  return (
    <div>
      <div role="group" aria-label="Perfil de quem" className="mb-4 flex flex-wrap gap-2">
        {choices.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={active === o}
            onClick={() => setVictim(o)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${active === o ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {o === "todos" ? "Todos" : MODE_SHORT[o]}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-gray-600">
        <span className="font-semibold tabular-nums text-gray-900">{n(profile.total)}</span> {who} mortas no período.
        {profile.total < FEW_CASES && " São poucos casos: os percentuais variam muito de um ano para o outro."}
      </p>
      <ProfileBars profile={profile} />
      <h4 className="mb-1 mt-6 text-sm font-semibold text-gray-900">Diagnósticos mais citados</h4>
      <p className="mb-3 text-sm text-gray-500">
        Lesões e complicações que a declaração registra além da causa principal, agrupadas por categoria (por exemplo, todo traumatismo intracraniano junto).
        Percentual das declarações que citam cada uma.
      </p>
      <SecondaryCauses profile={profile} />
    </div>
  );
}
