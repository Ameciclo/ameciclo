import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ameciclo/ui/components/badge";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { type RunRow, runsQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/sincronizacoes/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(runsQueryOptions()),
  component: SincronizacoesPage,
});

const KIND = { import: "Importação", osm: "OpenStreetMap" } as const;
const STATE = { running: "em andamento", success: "concluída", failed: "falhou" } as const;
const numeric = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

const columns: TableColumn<RunRow>[] = [
  {
    accessorKey: "startedAt",
    header: "Início",
    cell: ({ row }) => new Date(row.original.startedAt).toLocaleString("pt-BR"),
  },
  { accessorKey: "kind", header: "Origem", cell: ({ row }) => (row.original.kind === "osm" ? KIND.osm : KIND.import) },
  { accessorKey: "sourceRef", header: "Fonte", cell: ({ row }) => row.original.sourceRef ?? "—" },
  {
    accessorKey: "status",
    header: "Situação",
    cell: ({ row }) => {
      const state = row.original.status;
      return (
        <Badge variant={state === "failed" ? "destructive" : "secondary"}>
          {state === "running" || state === "success" || state === "failed" ? STATE[state] : state}
        </Badge>
      );
    },
  },
  { accessorKey: "waysAdded", header: "Novos", cell: ({ row }) => formatNumber(row.original.waysAdded), meta: numeric },
  { accessorKey: "waysUpdated", header: "Atualizados", cell: ({ row }) => formatNumber(row.original.waysUpdated), meta: numeric },
  { accessorKey: "waysRemoved", header: "Removidos", cell: ({ row }) => formatNumber(row.original.waysRemoved), meta: numeric },
  { accessorKey: "error", header: "Erro", cell: ({ row }) => row.original.error ?? "—" },
];

function SincronizacoesPage() {
  const { data: runs } = useSuspenseQuery(runsQueryOptions());
  return (
    <>
      <AdminTopbar title="Sincronizações" description="Cada importação de trechos e projetos do OpenStreetMap." />
      <div className="flex-1 px-6 py-6">
        <DataTable columns={columns} data={runs} initialSorting={[{ id: "startedAt", desc: true }]} emptyLabel="Nenhuma sincronização ainda." />
      </div>
    </>
  );
}
