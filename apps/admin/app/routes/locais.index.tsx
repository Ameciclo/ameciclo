import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatDate, formatNumber } from "~/lib/format";
import { localsQueryOptions, type listLocals } from "~/queries/contagens";

export const Route = createFileRoute("/locais/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(localsQueryOptions()),
  component: LocaisPage,
});

type Row = Awaited<ReturnType<typeof listLocals>>[number];

const columns: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Local", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  {
    accessorKey: "contagens",
    header: "Contagens",
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    accessorKey: "firstDate",
    header: "Primeira",
    cell: ({ row }) => formatDate(row.original.firstDate),
  },
  {
    accessorKey: "lastDate",
    header: "Última",
    cell: ({ row }) => formatDate(row.original.lastDate),
  },
  {
    accessorKey: "totalCyclists",
    header: "Ciclistas",
    cell: ({ row }) => formatNumber(row.original.totalCyclists),
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    id: "coordinates",
    header: "Coordenadas",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.latitude === null || row.original.longitude === null ? (
        "—"
      ) : (
        <span className="tabular-nums text-muted-foreground">
          {row.original.latitude.toFixed(5)}, {row.original.longitude.toFixed(5)}
        </span>
      ),
  },
];

function LocaisPage() {
  const { data: locals } = useSuspenseQuery(localsQueryOptions());
  return (
    <>
      <AdminTopbar title="Locais" description={`${formatNumber(locals.length)} pontos de contagem.`} />
      <div className="flex-1 px-6 py-6">
        <DataTable columns={columns} data={locals} filterPlaceholder="Buscar local..." initialSorting={[{ id: "name", desc: false }]} />
      </div>
    </>
  );
}
