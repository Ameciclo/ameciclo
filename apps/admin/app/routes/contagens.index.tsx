import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Plus } from "lucide-react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatDate, formatNumber, TOPOLOGY_LABEL } from "~/lib/format";
import { contagensQueryOptions, type listContagens } from "~/queries/contagens";

export const Route = createFileRoute("/contagens/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(contagensQueryOptions()),
  component: ContagensPage,
});

type Row = Awaited<ReturnType<typeof listContagens>>[number];

const columns: TableColumn<Row>[] = [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: "localName",
    header: "Local",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          to="/contagens/$id"
          params={{ id: String(row.original.id) }}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.localName}
        </Link>
        {row.original.variant && (
          <span className="ml-2 text-xs text-muted-foreground">{row.original.variant}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "topology",
    header: "Tipo",
    cell: ({ row }) => TOPOLOGY_LABEL[row.original.topology] ?? row.original.topology,
  },
  {
    accessorKey: "totalCyclists",
    header: "Ciclistas",
    cell: ({ row }) => formatNumber(row.original.totalCyclists),
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    accessorKey: "peakBucketCount",
    header: "Pico/h",
    cell: ({ row }) => formatNumber(row.original.peakBucketCount),
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    id: "flags",
    header: "Situação",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.status === "draft" && <Badge variant="outline">Rascunho</Badge>}
        {row.original.isProjected && <Badge variant="secondary">Estimada</Badge>}
        {row.original.isPartial && <Badge variant="secondary">Parcial</Badge>}
        {row.original.warnings > 0 && (
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="size-3" />
            {row.original.warnings}
          </Badge>
        )}
      </div>
    ),
  },
];

function ContagensPage() {
  const { data: contagens } = useSuspenseQuery(contagensQueryOptions());
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const data = onlyFlagged ? contagens.filter((c) => c.warnings > 0 || c.isProjected || c.isPartial) : contagens;

  return (
    <>
      <AdminTopbar
        title="Contagens"
        description={`${formatNumber(contagens.length)} contagens.`}
        actions={
          <Button asChild size="sm">
            <Link to="/contagens/nova">
              <Plus className="size-4" />
              Nova contagem
            </Link>
          </Button>
        }
      />
      <div className="flex-1 px-6 py-6">
        <DataTable
          columns={columns}
          data={data}
          filterPlaceholder="Buscar por local, data ou tipo..."
          initialSorting={[{ id: "date", desc: true }]}
          toolbar={
            <Button
              size="sm"
              variant={onlyFlagged ? "default" : "outline"}
              onClick={() => setOnlyFlagged((v) => !v)}
            >
              Só estimadas, parciais ou com avisos
            </Button>
          }
        />
      </div>
    </>
  );
}
