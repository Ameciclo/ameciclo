// Observatório de chamadas do SAMU: headline numbers and highlights first, then a map
// of the Região Metropolitana do Recife and an explorer (one city and range of years at a time).
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@ameciclo/ui/components/chart";
import type { SamuCount, SamuProfile } from "@ameciclo/db";
import { DataTable, type DataColumn } from "../Observatorio/DataTable";
import { n } from "../Observatorio/format";
import { PageHeader } from "../Observatorio/PageHeader";
import { SamuChoroplethMap } from "./SamuChoroplethMap";
import type { SamuCityView, SamuOverview } from "~/queries/dados.samu";

type City = SamuOverview["cities"][number];

interface SamuExplorerProps {
  overview: SamuOverview;
  view: SamuCityView;
  selection: { city: City | undefined; from: number; to: number; onlyComplete: boolean };
  onSelect: (next: { cidade?: number; de?: number; ate?: number; completos?: boolean }) => void;
}

const percent = (n: number, total: number) => (total > 0 ? `${((n / total) * 100).toFixed(1).replace(".", ",")}%` : "—");
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" });

// The four things that can happen to a patient, from the one that needs the least to the most.
const OUTCOMES = [
  { key: "concluded", label: "Atendimento concluído", color: "#059669" },
  { key: "removedByPrivate", label: "Removido por particulares", color: "#2563eb" },
  { key: "removedByFirefighters", label: "Removido pelos bombeiros", color: "#d97706" },
  { key: "deathOnSite", label: "Óbito no local", color: "#dc2626" },
] as const;

const count = (rows: SamuCount[], ...labels: string[]) =>
  rows.filter((r) => labels.includes(r.label)).reduce((sum, r) => sum + r.n, 0);

// Short sentences about the whole metropolitan region, each with the number behind it.
function highlights(state: SamuProfile) {
  const informed = state.gender.filter((g) => g.label !== "Não informado").reduce((sum, g) => sum + g.n, 0);
  const people = count(
    state.categories,
    "Atropelamento por Carro",
    "Atropelamento por Moto",
    "Atropelamento Ônibus/Caminhão",
    "Atropelamento por Bicicleta",
    "Acidente de Bicicleta",
  );
  return [
    {
      kind: "Motocicletas",
      text: `${percent(count(state.categories, "Acidente de Moto"), state.total)} dos chamados são sinistros de moto, sem contar atropelamentos por moto.`,
    },
    {
      kind: "Quem está fora do carro",
      text: `${percent(people, state.total)} dos chamados envolvem pedestres atropelados ou ciclistas.`,
    },
    {
      kind: "Quem é atendido",
      text: `Entre quem teve o sexo informado, ${percent(count(state.gender, "Masculino"), informed)} são homens.`,
    },
  ];
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const monthSpan = (y: { firstMonth: number; lastMonth: number }) =>
  y.firstMonth === y.lastMonth ? MONTHS[y.firstMonth - 1] : `${MONTHS[y.firstMonth - 1]} a ${MONTHS[y.lastMonth - 1]}`;

export default function SamuExplorer({ overview, view, selection, onSelect }: SamuExplorerProps) {
  const { city, from, to, onlyComplete } = selection;
  const years = overview.years.map((y) => y.year);
  const total = overview.years.reduce((sum, y) => sum + y.valid, 0);
  const peak = overview.years.reduce<(typeof overview.years)[number] | null>(
    (best, y) => (!best || y.valid > best.valid ? y : best),
    null,
  );
  const topCity = overview.cities[0];
  const partialYears = overview.partialYears;
  const isPartial = (year: number) => partialYears.some((y) => y.year === year);

  if (overview.dataUnavailable || !city || !overview.state) {
    return (
      <section className="container mx-auto px-4 my-10">
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-10 text-center">
          <p className="text-gray-700">Os dados do SAMU estão indisponíveis no momento.</p>
          <p className="text-sm text-gray-500 mt-1">Tente novamente em alguns instantes.</p>
        </div>
      </section>
    );
  }

  const stats = [
    { label: `chamados com atendimento, ${years[0]} a ${years[years.length - 1]}`, value: n(total) },
    { label: `chamados em ${peak?.year}, o ano com mais`, value: peak ? n(peak.valid) : "—" },
    { label: "municípios da Região Metropolitana do Recife", value: n(overview.cities.length) },
    { label: `dos chamados são de ${topCity.name}`, value: percent(topCity.total, total) },
  ];

  const allYears = from === years[0] && to === years[years.length - 1];
  const pickYear = (year: number) => {
    if (from !== to || year === from) onSelect({ de: year, ate: year });
    else onSelect({ de: Math.min(from, year), ate: Math.max(from, year) });
  };

  return (
    <>
      <PageHeader
        title="Chamados do SAMU por sinistros de trânsito"
        explanations={[
          {
            label: "O que são?",
            text: "Chamadas ao SAMU relacionadas a sinistros de trânsito. Mostram onde e como as pessoas se machucam, mesmo quando o sinistro não chega aos registros da polícia ou da CTTU.",
          },
          {
            label: "Como usamos os dados?",
            text: "Contamos os chamados em que houve atendimento: ficam de fora trotes, desistências, duplicados e chamados sem paciente. Nenhum chamado individual é exibido, só totais.",
          },
        ]}
      />

      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white border border-gray-200 p-4">
              <div className="text-3xl font-bold text-gray-900 tabular-nums">{s.value}</div>
              <div className="text-sm text-gray-600 mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
        {partialYears.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {onlyComplete ? "Fora da contagem, por terem meses faltando" : "* Anos incompletos"} na base do SAMU:{" "}
            {partialYears.map((y) => `${y.year} (${monthSpan(y)})`).join(", ")}
            {overview.until && `. Dados até ${day(overview.until)}`}.
          </p>
        )}
      </section>

      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-sm uppercase tracking-wide text-gray-500">Em destaque</h2>
        <p className="text-xs text-gray-500 mb-3 max-w-3xl">Região Metropolitana do Recife, todos os anos.</p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {highlights(overview.state).map((h) => (
            <li key={h.kind} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-ameciclo">{h.kind}</span>
              <span className="block mt-1 text-gray-800 leading-snug">{h.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto px-4 mt-10">
        <h2 className="text-xl font-bold text-gray-800">Onde estão os chamados</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">Chamados com atendimento, de todos os anos. Passe o mouse para ver os números e clique para abrir o município abaixo.</p>
        <SamuChoroplethMap
          cities={overview.cities}
          selectedIbge={city.ibge}
          onSelect={(ibge) => {
            onSelect({ cidade: ibge });
            document.getElementById("explorador")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      <section id="explorador" className="container mx-auto px-4 mt-10 grid scroll-mt-20 grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <nav className="space-y-5 md:sticky md:top-20 md:self-start">
          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Município</span>
            <select
              value={city.ibge}
              onChange={(e) => onSelect({ cidade: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              {[...overview.cities]
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                .map((c) => (
                  <option key={c.ibge} value={c.ibge}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Período</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSelect({ de: undefined, ate: undefined })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  allYears ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => pickYear(year)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !allYears && year >= from && year <= to
                      ? "bg-ameciclo text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {year}
                  {isPartial(year) ? "*" : ""}
                </button>
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={onlyComplete}
                // Years and range may no longer exist once the list changes: start over from all of them.
                onChange={(e) => onSelect({ completos: e.target.checked ? undefined : false, de: undefined, ate: undefined })}
                className="mt-0.5 accent-ameciclo"
              />
              <span>Apenas anos completos</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {from === to ? "Clique em outro ano para escolher um intervalo." : "Clique em um ano para recomeçar."}
            </p>
          </div>
        </nav>

        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-800">
            {city.name}, {from === to ? from : `${from} a ${to}`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {view.profile
              ? `${n(view.profile.total)} chamados com atendimento, de ${n(view.profile.received)} recebidos.`
              : "Os dados deste município estão indisponíveis no momento."}
          </p>

          {view.evolution.length > 0 && <Evolution evolution={view.evolution} city={city.name} />}

          {view.profile && view.profile.total > 0 && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Distribution title="Tipo de sinistro" rows={view.profile.categories} total={view.profile.total} />
              <Distribution title="Sexo" rows={view.profile.gender} total={view.profile.total} />
              <Distribution title="Faixa etária" rows={view.profile.ageGroups} total={view.profile.total} />
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 my-10">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Todos os municípios</h2>
        <CitiesTable cities={overview.cities} selectedIbge={city.ibge} />
      </section>
    </>
  );
}

function Evolution({ evolution, city }: { evolution: SamuCityView["evolution"]; city: string }) {
  const config: ChartConfig = Object.fromEntries(OUTCOMES.map((o) => [o.key, { label: o.label, color: o.color }]));
  const data = evolution.map((e) => ({ ...e, year: String(e.year) }));

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Chamados por ano, {city}</h3>
      <ChartContainer config={config} className="mt-3 aspect-auto h-72 w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis width={48} tickLine={false} axisLine={false} tickFormatter={(v: number) => n(v)} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => n(Number(v))} />} />
          <ChartLegend content={<ChartLegendContent />} />
          {OUTCOMES.map((o) => (
            <Bar key={o.key} dataKey={o.key} stackId="outcome" fill={`var(--color-${o.key})`} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function Distribution({ title, rows, total }: { title: string; rows: SamuCount[]; total: number }) {
  const visible = rows.filter((r) => r.n > 0);
  const max = Math.max(...visible.map((r) => r.n), 1);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{title}</h3>
      <ul className="mt-3 space-y-2">
        {visible.map((r) => (
          <li key={r.label} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-gray-800">{r.label}</span>
              <span className="shrink-0 tabular-nums text-gray-500">
                {percent(r.n, total)} · {n(r.n)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-ameciclo" style={{ width: `${(r.n / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

type CityRow = City & { rank: number };

// Every municipality, biggest first. Clicking one selects it in the explorer above.
function CitiesTable({ cities, selectedIbge }: { cities: City[]; selectedIbge: number }) {
  const max = cities[0]?.total ?? 1;
  // The rank is the place in the whole list, so it does not change when sorting or filtering.
  const data = useMemo<CityRow[]>(() => cities.map((c, i) => ({ ...c, rank: i + 1 })), [cities]);

  const columns = useMemo<DataColumn<CityRow>[]>(
    () => [
      { accessorKey: "rank", header: "#", cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.rank}</span> },
      {
        accessorKey: "name",
        header: "Município",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <Link
            to="/dados/chamados-de-sinistros"
            search={(prev) => ({ ...prev, cidade: row.original.ibge })}
            hash="explorador"
            resetScroll={false}
            className={row.original.ibge === selectedIbge ? "font-semibold text-ameciclo hover:underline" : "hover:underline"}
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "total", header: "Chamados", meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{n(row.original.total)}</span> },
      {
        id: "share",
        header: "Proporção do maior",
        accessorFn: (c) => c.total,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="h-1.5 w-full min-w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-ameciclo" style={{ width: `${(row.original.total / max) * 100}%` }} />
          </div>
        ),
      },
    ],
    [selectedIbge, max],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      initialSort={{ id: "total", desc: true }}
      search={{ placeholder: "Buscar município", text: (c) => c.name }}
      isSelected={(c) => c.ibge === selectedIbge}
      emptyText="Nenhum município encontrado."
    />
  );
}
