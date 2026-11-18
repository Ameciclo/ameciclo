import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { SamuFilters } from "~/components/SamuFilters";
import { formatNumber } from "~/lib/format";
import { type SamuStreetRow, samuStreetsQueryOptions, samuSummaryQueryOptions } from "~/queries/samu";

type Search = { cidade: number; de?: number; ate?: number };

const RECIFE = 2611606;
const year = (v: unknown) => (typeof v === "number" && v >= 2000 && v <= 2100 ? v : undefined);

export const Route = createFileRoute("/samu/ruas/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cidade: typeof search.cidade === "number" ? search.cidade : RECIFE,
    de: year(search.de),
    ate: year(search.ate),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(samuSummaryQueryOptions()),
      queryClient.ensureQueryData(samuStreetsQueryOptions({ cityIbge: deps.cidade, fromYear: deps.de, toYear: deps.ate })),
    ]),
  component: RuasPage,
});

const right = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

// Pedestrians hit by any vehicle, and cyclists: the people the ranking is meant to protect.
const VULNERABLE = ["Atropelamento por Carro", "Atropelamento por Moto", "Atropelamento Ônibus/Caminhão", "Atropelamento por Bicicleta", "Acidente de Bicicleta"];

const vulnerable = (s: SamuStreetRow) => VULNERABLE.reduce((n, c) => n + (s.byCategory[c] ?? 0), 0);

const columns: TableColumn<SamuStreetRow>[] = [
  { id: "rank", header: "#", enableSorting: false, cell: ({ row }) => row.index + 1, meta: { cellClassName: "w-10 tabular-nums text-muted-foreground" } },
  { accessorKey: "street", header: "Rua", cell: ({ row }) => <span className="font-medium">{row.original.street}</span> },
  { accessorKey: "n", header: "Chamados", cell: ({ row }) => formatNumber(row.original.n), meta: right },
  {
    id: "vulnerable",
    header: "Atropelamentos e bicicletas",
    accessorFn: vulnerable,
    cell: ({ row }) => formatNumber(vulnerable(row.original)),
    meta: right,
  },
  {
    id: "moto",
    header: "Moto",
    accessorFn: (s) => s.byCategory["Acidente de Moto"] ?? 0,
    cell: ({ row }) => formatNumber(row.original.byCategory["Acidente de Moto"] ?? 0),
    meta: right,
  },
];

function RuasPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: summary } = useSuspenseQuery(samuSummaryQueryOptions());
  const { data: streets } = useSuspenseQuery(
    samuStreetsQueryOptions({ cityIbge: search.cidade, fromYear: search.de, toYear: search.ate }),
  );
  const city = summary.cities.find((c) => c.ibge === search.cidade);

  return (
    <>
      <AdminTopbar
        title="Ruas com mais chamados"
        description="As 100 ruas com mais chamados do SAMU com atendimento. Só o Recife tem o nome da rua identificado nos dados; nos outros municípios não há ranking."
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <SamuFilters summary={summary} value={search} onChange={(next) => navigate({ search: { ...next, cidade: next.cidade ?? RECIFE } })} allowAllCities={false} />
        {streets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma rua identificada em {city?.name ?? "este município"}: o nome da rua só existe nos dados do Recife.
          </p>
        ) : (
          <DataTable columns={columns} data={streets} filterPlaceholder="Buscar rua..." initialSorting={[{ id: "n", desc: true }]} />
        )}
      </div>
    </>
  );
}
