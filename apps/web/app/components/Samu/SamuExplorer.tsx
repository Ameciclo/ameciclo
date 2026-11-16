// Observatório de chamadas do SAMU: headline numbers and highlights first, then a map
// of the Região Metropolitana do Recife and an explorer (one city and range of years at a time).
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ColumnDef,
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@ameciclo/ui/components/chart";
import { Input } from "@ameciclo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import type { SamuCount, SamuProfile } from "@ameciclo/db";
import { SamuChoroplethMap } from "./SamuChoroplethMap";
import type { SamuCityView, SamuOverview } from "~/queries/dados.samu";

type City = SamuOverview["cities"][number];

interface SamuExplorerProps {
  overview: SamuOverview;
  view: SamuCityView;
  selection: { city: City | undefined; from: number; to: number };
  onSelect: (next: { cidade?: number; de?: number; ate?: number }) => void;
}

const number = (n: number) => n.toLocaleString("pt-BR");
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
  const { city, from, to } = selection;
  const years = overview.years.map((y) => y.year);
  const total = overview.years.reduce((sum, y) => sum + y.valid, 0);
  const peak = overview.years.reduce<(typeof overview.years)[number] | null>(
    (best, y) => (!best || y.valid > best.valid ? y : best),
    null,
  );
  const topCity = overview.cities[0];
  const partialYears = overview.years.filter((y) => y.months < 12);
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
    { label: `chamados com atendimento, ${years[0]} a ${years[years.length - 1]}`, value: number(total) },
    { label: `chamados em ${peak?.year}, o ano com mais`, value: peak ? number(peak.valid) : "—" },
    { label: "municípios da Região Metropolitana do Recife", value: number(overview.cities.length) },
    { label: `dos chamados são de ${topCity.name}`, value: percent(topCity.total, total) },
  ];

  const allYears = from === years[0] && to === years[years.length - 1];
  const pickYear = (year: number) => {
    if (from !== to || year === from) onSelect({ de: year, ate: year });
    else onSelect({ de: Math.min(from, year), ate: Math.max(from, year) });
  };

  return (
    <>
      <header className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">Chamados do SAMU por sinistros de trânsito</h1>
        <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          {[
            [
              "O que são?",
              "Chamadas ao SAMU relacionadas a sinistros de trânsito. Mostram onde e como as pessoas se machucam, mesmo quando o sinistro não chega aos registros da polícia ou da CTTU.",
            ],
            [
              "Como usamos os dados?",
              "Contamos os chamados em que houve atendimento: ficam de fora trotes, desistências, duplicados e chamados sem paciente. Nenhum chamado individual é exibido, só totais.",
            ],
          ].map(([label, text]) => (
            <section key={label} className="border-t-2 border-ameciclo pt-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{label}</h2>
              <p className="mt-2 max-w-prose text-gray-700 leading-relaxed">{text}</p>
            </section>
          ))}
        </div>
      </header>

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
            * Anos incompletos na base do SAMU:{" "}
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
              ? `${number(view.profile.total)} chamados com atendimento, de ${number(view.profile.received)} recebidos.`
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
          <YAxis width={48} tickLine={false} axisLine={false} tickFormatter={(v: number) => number(v)} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => number(Number(v))} />} />
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
                {percent(r.n, total)} · {number(r.n)}
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

const tableFeatures_ = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

// Every municipality, biggest first. Clicking one selects it in the explorer above.
function CitiesTable({ cities, selectedIbge }: { cities: City[]; selectedIbge: number }) {
  const max = cities[0]?.total ?? 1;
  // The rank is the place in the whole list, so it does not change when sorting or filtering.
  const data = useMemo<CityRow[]>(() => cities.map((c, i) => ({ ...c, rank: i + 1 })), [cities]);

  const columns = useMemo<ColumnDef<typeof tableFeatures_, CityRow>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.rank}</span>,
      },
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
            className={
              row.original.ibge === selectedIbge ? "font-semibold text-ameciclo hover:underline" : "hover:underline"
            }
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "total",
        header: "Chamados",
        cell: ({ row }) => <span className="tabular-nums">{number(row.original.total)}</span>,
      },
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

  const table = useTable({
    features: tableFeatures_,
    columns,
    data,
    initialState: { sorting: [{ id: "total", desc: true }] },
    globalFilterFn: (row, _columnId, value) =>
      row.original.name.toLocaleLowerCase("pt-BR").includes(String(value).trim().toLocaleLowerCase("pt-BR")),
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={table.state.globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Buscar município"
          aria-label="Buscar município"
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const right = header.column.id === "total";
                  return (
                    <TableHead key={header.id} className={right ? "text-right" : undefined}>
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <table.FlexRender header={header} />
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum município encontrado.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.original.ibge === selectedIbge ? "selected" : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "total" ? "text-right" : undefined}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
