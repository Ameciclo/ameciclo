import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { BarList } from "~/components/BarList";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { EvolutionChart } from "~/components/EvolutionChart";
import { SamuFilters } from "~/components/SamuFilters";
import { formatNumber } from "~/lib/format";
import { type SamuSummary, samuProfileQueryOptions, samuSummaryQueryOptions } from "~/queries/samu";

type Search = { cidade?: number; de?: number; ate?: number };

const year = (v: unknown) => (typeof v === "number" && v >= 2000 && v <= 2100 ? v : undefined);

export const Route = createFileRoute("/samu/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cidade: typeof search.cidade === "number" ? search.cidade : undefined,
    de: year(search.de),
    ate: year(search.ate),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(samuSummaryQueryOptions()),
      queryClient.ensureQueryData(samuProfileQueryOptions({ cityIbge: deps.cidade, fromYear: deps.de, toYear: deps.ate })),
    ]),
  component: SamuPage,
});

type CityRow = SamuSummary["cities"][number];

const right = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

function SamuPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: summary } = useSuspenseQuery(samuSummaryQueryOptions());
  const { data: profile } = useSuspenseQuery(
    samuProfileQueryOptions({ cityIbge: search.cidade, fromYear: search.de, toYear: search.ate }),
  );

  const first = summary.years[0]?.year;
  const last = summary.years.at(-1)?.year;
  const city = summary.cities.find((c) => c.ibge === search.cidade);
  const scope = city?.name ?? "Pernambuco";
  const received = summary.years.reduce((n, y) => n + y.received, 0);
  const valid = summary.years.reduce((n, y) => n + y.valid, 0);

  const series = {
    name: scope,
    values: new Map(
      summary.years.map((y) => [y.year, city ? (city.byYear[y.year] ?? 0) : y.valid] as [number, number]),
    ),
  };

  const columns: TableColumn<CityRow>[] = [
    {
      accessorKey: "name",
      header: "Município",
      cell: ({ row }) => (
        <Link to="/samu" search={{ cidade: row.original.ibge }} className="font-medium underline-offset-4 hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { id: "rmr", header: "RMR", accessorFn: (c) => (c.isRmr ? "Sim" : "Não") },
    { accessorKey: "total", header: "Chamados", cell: ({ row }) => formatNumber(row.original.total), meta: right },
    ...summary.years.map(
      ({ year: y }): TableColumn<CityRow> => ({
        id: String(y),
        header: String(y),
        accessorFn: (c) => c.byYear[y] ?? 0,
        cell: ({ row }) => formatNumber(row.original.byYear[y] ?? 0),
        meta: right,
      }),
    ),
  ];

  return (
    <>
      <AdminTopbar
        title="Chamados do SAMU"
        description={`Chamados por sinistro de trânsito, ${first} a ${last}. Só agregados: nenhum chamado individual é exibido. As estatísticas contam os chamados com atendimento.`}
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Chamados recebidos" value={formatNumber(received)} />
          <Stat label="Com atendimento" value={formatNumber(valid)} hint={`${((valid / received) * 100).toFixed(1).replace(".", ",")}% do recebido`} />
          <Stat label="Municípios" value={formatNumber(summary.cities.length)} />
          <Stat label="Ano com mais chamados" value={String([...summary.years].sort((a, b) => b.valid - a.valid)[0]?.year ?? "—")} />
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-base">Evolução por ano: {scope}</CardTitle>
            <SamuFilters summary={summary} value={search} onChange={(next) => navigate({ search: next })} />
          </CardHeader>
          <CardContent>
            <EvolutionChart a={series} format={(v) => formatNumber(v)} />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-1 text-base font-semibold">
            {scope}, {search.de ?? first} a {search.ate ?? last}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            {formatNumber(profile.total)} chamados com atendimento, de {formatNumber(profile.received)} recebidos.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Block title="Tipo de sinistro" rows={profile.categories} total={profile.total} />
            <Block title="Sexo" rows={profile.gender} total={profile.total} />
            <Block title="Faixa etária" rows={profile.ageGroups} total={profile.total} />
            <Block
              title="Desfecho do chamado"
              note="Todos os chamados recebidos, também os que não viraram atendimento."
              rows={profile.outcomes}
              total={profile.received}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold">Municípios</h2>
          <DataTable columns={columns} data={summary.cities} filterPlaceholder="Buscar município..." initialSorting={[{ id: "total", desc: true }]} />
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

function Block({ title, note, rows, total }: { title: string; note?: string; rows: { label: string; n: number }[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardHeader>
      <CardContent>
        <BarList rows={rows} answered={total} />
      </CardContent>
    </Card>
  );
}
