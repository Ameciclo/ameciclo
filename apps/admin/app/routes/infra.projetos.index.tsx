import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@ameciclo/ui/components/badge";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { formatKm, STAGE_LABEL } from "~/lib/infra";
import { type ProjectRow, projectsQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/projetos/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(projectsQueryOptions()),
  component: ProjetosPage,
});

const numeric = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

const columns: TableColumn<ProjectRow>[] = [
  {
    accessorKey: "ref",
    header: "Código",
    cell: ({ row }) => (
      <Link to="/infra/projetos/$id" params={{ id: String(row.original.id) }} className="font-mono text-sm font-medium underline-offset-2 hover:underline">
        {row.original.ref}
      </Link>
    ),
  },
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "typology", header: "Tipologia" },
  {
    accessorKey: "stage",
    header: "Estágio",
    cell: ({ row }) => <Badge variant={row.original.stage === "existing" ? "default" : "secondary"}>{STAGE_LABEL[row.original.stage]}</Badge>,
  },
  { id: "cities", header: "Cidades", accessorFn: (p) => p.cities.join(", ") },
  { id: "agencies", header: "Responsável", accessorFn: (p) => p.agencies.join(", ") || "—" },
  { accessorKey: "plannedKm", header: "Previsto (km)", cell: ({ row }) => formatKm(row.original.plannedKm), meta: numeric },
  { accessorKey: "mappedKm", header: "Mapeado (km)", cell: ({ row }) => formatKm(row.original.mappedKm), meta: numeric },
  {
    id: "built",
    header: "Com ciclovia",
    accessorFn: (p) => (p.mappedKm > 0 ? p.builtKm / p.mappedKm : 0),
    cell: ({ row }) =>
      row.original.mappedKm > 0 ? `${Math.round((row.original.builtKm / row.original.mappedKm) * 100)}%` : "—",
    meta: numeric,
  },
];

function ProjetosPage() {
  const { data: projects } = useSuspenseQuery(projectsQueryOptions());
  return (
    <>
      <AdminTopbar title="Projetos do PDC" description={`${formatNumber(projects.length)} projetos do Plano Diretor Cicloviário.`} />
      <div className="flex-1 px-6 py-6">
        <DataTable columns={columns} data={projects} filterPlaceholder="Buscar projeto, cidade ou responsável..." initialSorting={[{ id: "ref", desc: false }]} />
      </div>
    </>
  );
}
