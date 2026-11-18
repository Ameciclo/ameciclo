import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { type ColetaRun, coletasQueryOptions } from "~/queries/coletas";

export const Route = createFileRoute("/coletas/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(coletasQueryOptions()),
  component: ColetasPage,
});

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Recife" });
const when = (iso: string | null) => (iso ? dateTime.format(new Date(iso)) : "—");

const PIPELINE_NAMES: Record<string, string> = { "mortes-sim": "Mortes no trânsito (SIM/DATASUS)" };
const name = (pipeline: string) => PIPELINE_NAMES[pipeline] ?? pipeline;

const right = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

const columns: TableColumn<ColetaRun>[] = [
  { id: "quando", header: "Quando", accessorFn: (r) => r.startedAt, cell: ({ row }) => when(row.original.startedAt) },
  { id: "pipeline", header: "Pipeline", accessorFn: (r) => name(r.pipeline), cell: ({ row }) => name(row.original.pipeline) },
  { accessorKey: "sourceKey", header: "Fatia" },
  {
    accessorKey: "status",
    header: "Resultado",
    cell: ({ row }) =>
      row.original.status === "ok" ? (
        <span className="font-medium text-emerald-700">ok</span>
      ) : (
        <span className="font-medium text-red-700" title={row.original.error ?? undefined}>erro</span>
      ),
  },
  { id: "versao", header: "Versão da fonte", accessorFn: (r) => r.sourceVersion ?? "—" },
  { id: "modificado", header: "Fonte modificada", accessorFn: (r) => r.sourceModifiedAt ?? "", cell: ({ row }) => when(row.original.sourceModifiedAt) },
  { id: "lidas", header: "Linhas lidas", accessorFn: (r) => r.rowsRead ?? 0, cell: ({ row }) => formatNumber(row.original.rowsRead), meta: right },
  { id: "gravadas", header: "Gravadas", accessorFn: (r) => r.rowsLoaded ?? 0, cell: ({ row }) => formatNumber(row.original.rowsLoaded), meta: right },
  {
    id: "descartadas",
    header: "Descartadas",
    accessorFn: (r) => Object.values(r.discarded ?? {}).reduce((a, b) => a + b, 0),
    cell: ({ row }) => {
      const entries = Object.entries(row.original.discarded ?? {});
      if (entries.length === 0) return "—";
      return (
        <span title={entries.map(([why, n]) => `${why}: ${formatNumber(n)}`).join("\n")}>
          {formatNumber(entries.reduce((a, [, n]) => a + n, 0))}
        </span>
      );
    },
    meta: right,
  },
];

function ColetasPage() {
  const { data } = useSuspenseQuery(coletasQueryOptions());
  return (
    <>
      <AdminTopbar
        title="Coletas"
        description="O que cada pipeline de dados importou e quando. O agendador (Dagu) guarda o histórico dos passos; aqui fica o estado dos dados: de que versão da fonte veio, quantas linhas entraram e o que foi descartado."
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        {data.summary.length === 0 ? (
          <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nenhuma execução registrada ainda. Elas aparecem aqui depois da primeira importação feita pelo agendador.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.summary.map((s) => (
              <Card key={s.pipeline}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{name(s.pipeline)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className={`text-2xl font-semibold ${s.lastStatus === "ok" ? "text-emerald-700" : "text-red-700"}`}>
                    {s.lastStatus === "ok" ? "Última execução ok" : "Última execução com erro"}
                  </div>
                  <p>Última execução: {when(s.lastRunAt)}</p>
                  <p>Última que deu certo: {when(s.lastOkAt)}</p>
                  <p className="text-muted-foreground">
                    {formatNumber(s.runs)} execuções, {formatNumber(s.failures)} com erro.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div>
          <h2 className="mb-3 text-base font-semibold">Execuções recentes</h2>
          <DataTable columns={columns} data={data.runs} filterPlaceholder="Buscar..." initialSorting={[{ id: "quando", desc: true }]} />
        </div>
      </div>
    </>
  );
}
