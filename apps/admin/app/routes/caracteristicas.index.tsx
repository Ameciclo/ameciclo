import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ameciclo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { characteristicsQueryOptions, type listCharacteristics } from "~/queries/contagens";

export const Route = createFileRoute("/caracteristicas/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(characteristicsQueryOptions()),
  component: CharacteristicsPage,
});

type Data = Awaited<ReturnType<typeof listCharacteristics>>;
type DictionaryRow = Data["dictionary"][number];
type UnmappedRow = Data["unmapped"][number];

const dictionaryColumns: TableColumn<DictionaryRow>[] = [
  {
    accessorKey: "label",
    header: "Característica",
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.label}</span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">{row.original.key}</span>
      </div>
    ),
  },
  { accessorKey: "group", header: "Grupo" },
  {
    accessorKey: "parentKey",
    header: "Compõe",
    cell: ({ row }) => row.original.parentKey ?? (row.original.isRollup ? <Badge variant="secondary">total</Badge> : "—"),
  },
  {
    accessorKey: "contagens",
    header: "Contagens",
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    id: "aliases",
    header: "Rótulos reconhecidos",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.aliases.join(", ") || "—"}</span>
    ),
  },
];

const unmappedColumns: TableColumn<UnmappedRow>[] = [
  { accessorKey: "rawLabel", header: "Rótulo na planilha", cell: ({ row }) => <span className="font-medium">{row.original.rawLabel}</span> },
  {
    accessorKey: "contagens",
    header: "Contagens",
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
  {
    accessorKey: "rows",
    header: "Linhas",
    meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
  },
];

function CharacteristicsPage() {
  const {
    data: { dictionary, unmapped },
  } = useSuspenseQuery(characteristicsQueryOptions());
  return (
    <>
      <AdminTopbar
        title="Características"
        description="Dicionário canônico e rótulos ainda sem mapeamento."
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Sem mapeamento ({formatNumber(unmapped.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={unmappedColumns}
              data={unmapped}
              pageSize={10}
              emptyLabel="Todos os rótulos importados estão mapeados."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dicionário ({formatNumber(dictionary.length)})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={dictionaryColumns}
              data={dictionary}
              filterPlaceholder="Buscar característica..."
              pageSize={15}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
