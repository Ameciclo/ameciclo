import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { BarList } from "~/components/BarList";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { EvolutionChart } from "~/components/EvolutionChart";
import { formatNumber } from "~/lib/format";
import { type Basis, type DeathOverview, deathOverviewQueryOptions, deathStatsQueryOptions } from "~/queries/mortes";

type Search = { olhar?: Basis; cidade?: number; de?: number; ate?: number };

const year = (v: unknown) => (typeof v === "number" && v >= 2000 && v <= 2100 ? v : undefined);

export const Route = createFileRoute("/mortes/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    olhar: search.olhar === "residencia" ? "residencia" : undefined,
    cidade: typeof search.cidade === "number" ? search.cidade : undefined,
    de: year(search.de),
    ate: year(search.ate),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(deathOverviewQueryOptions()),
      queryClient.ensureQueryData(
        deathStatsQueryOptions({ basis: deps.olhar ?? "ocorrencia", city: deps.cidade, yearFrom: deps.de, yearTo: deps.ate }),
      ),
    ]),
  component: MortesPage,
});

type CityRow = DeathOverview["byBasis"][Basis]["byCity"][number];

const right = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };
const selectClass = "rounded-md border bg-background px-3 py-1.5 text-sm";

function MortesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const basis: Basis = search.olhar ?? "ocorrencia";
  const { data: overview } = useSuspenseQuery(deathOverviewQueryOptions());
  const first = overview.years[0];
  const last = overview.years.at(-1);
  const from = search.de ?? first;
  const to = search.ate ?? last;
  const { data: stats } = useSuspenseQuery(
    deathStatsQueryOptions({ basis, city: search.cidade, yearFrom: from, yearTo: to }),
  );

  const series = overview.byBasis[basis];
  const city = series.byCity.find((c) => c.city === search.cidade);
  const scope = city?.name ?? "Região Metropolitana";
  const total = series.byYear.reduce((n, y) => n + y.total, 0);
  const evolution = {
    name: scope,
    values: new Map(
      series.byYear.map((y) => [y.year, city ? (city.years[y.year] ?? 0) : y.total] as [number, number]),
    ),
  };
  const aged = stats.byAge.reduce((n, a) => n + a.total, 0);

  const columns: TableColumn<CityRow>[] = [
    {
      accessorKey: "name",
      header: "Município",
      cell: ({ row }) => (
        <Link to="/mortes" search={{ olhar: search.olhar, cidade: row.original.city }} className="font-medium underline-offset-4 hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "total", header: "Mortes", cell: ({ row }) => formatNumber(row.original.total), meta: right },
    ...overview.years.map(
      (y): TableColumn<CityRow> => ({
        id: String(y),
        header: String(y),
        accessorFn: (c) => c.years[y] ?? 0,
        cell: ({ row }) => formatNumber(row.original.years[y] ?? 0),
        meta: right,
      }),
    ),
  ];

  return (
    <>
      <AdminTopbar
        title="Mortes no trânsito"
        description={`Óbitos por acidentes de transporte (CID-10 V01 a V89) do SIM/DATASUS na Região Metropolitana do Recife, ${first} a ${last}. Só agregados: nenhum óbito individual é exibido.`}
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={`Mortes, ${first} a ${last}`} value={formatNumber(total)} />
          <Stat label={`Mortes em ${last}`} value={formatNumber(series.byYear.at(-1)?.total ?? 0)} />
          <Stat label="Municípios" value={formatNumber(series.byCity.length)} />
          <Stat label="Último ano publicado" value={String(overview.updatedThrough ?? "—")} hint="O DATASUS publica cada ano cerca de um ano depois." />
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-base">Evolução por ano: {scope}</CardTitle>
            <div className="flex flex-wrap gap-3">
              <select
                aria-label="Olhar"
                className={selectClass}
                value={basis}
                onChange={(e) => navigate({ search: { ...search, olhar: e.target.value === "residencia" ? "residencia" : undefined } })}
              >
                <option value="ocorrencia">Onde morreram</option>
                <option value="residencia">Onde moravam</option>
              </select>
              <select
                aria-label="Município"
                className={selectClass}
                value={search.cidade ?? ""}
                onChange={(e) => navigate({ search: { ...search, cidade: e.target.value === "" ? undefined : Number(e.target.value) } })}
              >
                <option value="">Região Metropolitana</option>
                {[...series.byCity].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((c) => (
                  <option key={c.city} value={c.city}>{c.name}</option>
                ))}
              </select>
              <select aria-label="De" className={selectClass} value={from} onChange={(e) => navigate({ search: { ...search, de: Number(e.target.value) } })}>
                {overview.years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select aria-label="Até" className={selectClass} value={to} onChange={(e) => navigate({ search: { ...search, ate: Number(e.target.value) } })}>
                {overview.years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <EvolutionChart a={evolution} format={(v) => formatNumber(v ?? 0)} />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-1 text-base font-semibold">
            {scope}, {from} a {to}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">{formatNumber(stats.total)} mortes.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Block title="Quem morreu" rows={Object.entries(stats.byMode).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n)} total={stats.total} />
            <Block title="Sexo" rows={[{ label: "Homens", n: stats.bySex.masculino }, { label: "Mulheres", n: stats.bySex.feminino }, { label: "Não informado", n: stats.bySex.ignorado }]} total={stats.total} />
            <Block title="Raça ou cor" rows={stats.byRace.map((r) => ({ label: r.label, n: r.total }))} total={stats.total} />
            <Block title="Faixa etária" rows={stats.byAge.map((a) => ({ label: a.label, n: a.total }))} total={aged} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold">Municípios</h2>
          <DataTable columns={columns} data={series.byCity} filterPlaceholder="Buscar município..." initialSorting={[{ id: "total", desc: true }]} />
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Block({ title, rows, total }: { title: string; rows: { label: string; n: number }[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarList rows={rows} answered={total} />
      </CardContent>
    </Card>
  );
}
