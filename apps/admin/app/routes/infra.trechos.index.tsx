import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@ameciclo/ui/components/badge";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { formatKm, isWayStatus, STATUS } from "~/lib/infra";
import { type WayRow, waysQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/trechos/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(waysQueryOptions()),
  component: TrechosPage,
});

const columns: TableColumn<WayRow>[] = [
  {
    accessorKey: "name",
    header: "Trecho",
    cell: ({ row }) => (
      <Link to="/infra/trechos/$id" params={{ id: String(row.original.id) }} className="font-medium underline-offset-2 hover:underline">
        {row.original.name ?? <span className="text-muted-foreground">sem nome · {row.original.osmId}</span>}
      </Link>
    ),
  },
  { accessorKey: "highway", header: "Via", cell: ({ row }) => row.original.highway ?? "—" },
  {
    accessorKey: "city",
    header: "Cidade",
    cell: ({ row }) => (
      <>
        {row.original.city ?? "—"}
        {row.original.cityManual && <span className="ml-1 text-xs text-muted-foreground">(manual)</span>}
      </>
    ),
  },
  { accessorKey: "built", header: "Construído", cell: ({ row }) => row.original.built ?? "—" },
  { id: "projects", header: "Projetos", accessorFn: (w) => w.projects.join(", ") || "—" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      isWayStatus(row.original.status) ? (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: STATUS[row.original.status].color }} />
          {STATUS[row.original.status].label}
        </Badge>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "km",
    header: "km",
    cell: ({ row }) => formatKm(row.original.km),
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
];

function TrechosPage() {
  const { data: ways } = useSuspenseQuery(waysQueryOptions());
  return (
    <>
      <AdminTopbar title="Trechos" description={`${formatNumber(ways.length)} trechos mapeados no OpenStreetMap.`} />
      <div className="flex-1 px-6 py-6">
        <DataTable columns={columns} data={ways} filterPlaceholder="Buscar por nome, cidade, projeto ou status..." pageSize={25} />
      </div>
    </>
  );
}
