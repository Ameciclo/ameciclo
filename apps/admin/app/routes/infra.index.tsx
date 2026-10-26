import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { StatusBar } from "~/components/StatusBar";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { formatKm, STAGE_LABEL, STATUS, STATUS_ORDER, type WayStatus } from "~/lib/infra";
import { type CityRow, infraOverviewQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(infraOverviewQueryOptions()),
  component: InfraOverview,
});

const KM_KEY = {
  pdc_realizado_designado: "designado",
  pdc_realizado_nao_designado: "naoDesignado",
  realizado_fora_pdc: "foraPdc",
  pdc_nao_realizado: "naoRealizado",
} as const satisfies Record<WayStatus, keyof CityRow>;

const executed = (c: CityRow) => c.designado + c.naoDesignado + c.foraPdc;
// Of what the plan covers on the mapped ways, how much already has a cycleway.
const planShare = (c: CityRow) => {
  const inPlan = c.designado + c.naoDesignado + c.naoRealizado;
  return inPlan > 0 ? (c.designado + c.naoDesignado) / inPlan : null;
};
const kmByStatus = (c: CityRow): Record<WayStatus, number> => ({
  pdc_realizado_designado: c.designado,
  pdc_realizado_nao_designado: c.naoDesignado,
  realizado_fora_pdc: c.foraPdc,
  pdc_nao_realizado: c.naoRealizado,
});

const numeric = { headClassName: "text-right", cellClassName: "text-right tabular-nums" };

const columns: TableColumn<CityRow>[] = [
  { accessorKey: "name", header: "Cidade", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  {
    id: "executed",
    header: "Total executado",
    accessorFn: executed,
    cell: ({ row }) => <span className="font-semibold">{formatKm(executed(row.original))}</span>,
    meta: numeric,
  },
  {
    id: "planShare",
    header: "% do plano feito",
    accessorFn: (c) => planShare(c) ?? -1,
    cell: ({ row }) => {
      const share = planShare(row.original);
      return share === null ? "—" : `${(share * 100).toFixed(1).replace(".", ",")}%`;
    },
    meta: numeric,
  },
  {
    id: "bar",
    header: "Proporção",
    enableSorting: false,
    cell: ({ row }) => <StatusBar km={kmByStatus(row.original)} />,
  },
  ...STATUS_ORDER.map(
    (status): TableColumn<CityRow> => ({
      id: status,
      header: STATUS[status].label,
      accessorFn: (c) => c[KM_KEY[status]],
      cell: ({ row }) => formatKm(row.original[KM_KEY[status]]),
      meta: numeric,
    }),
  ),
];

function InfraOverview() {
  const { data } = useSuspenseQuery(infraOverviewQueryOptions());
  const km = (status: WayStatus) => data.cities.reduce((sum, c) => sum + c[KM_KEY[status]], 0);
  const built = km("pdc_realizado_designado") + km("pdc_realizado_nao_designado");
  const planned = built + km("pdc_nao_realizado");
  const totalExecuted = built + km("realizado_fora_pdc");

  const [onlyBuilt, setOnlyBuilt] = useState(false);
  const [onlyPlan, setOnlyPlan] = useState(false);
  const cities = data.cities.filter(
    (c) => (!onlyBuilt || executed(c) > 0) && (!onlyPlan || c.designado + c.naoDesignado + c.naoRealizado > 0),
  );

  return (
    <>
      <AdminTopbar
        title="Infraestrutura cicloviária"
        description="Plano (PDC Cicloviário) e o que existe no OpenStreetMap. Km somados pela geometria dos trechos."
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total executado</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{formatKm(totalExecuted)} km</div>
            </CardContent>
          </Card>
          {STATUS_ORDER.map((status) => (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground" title={STATUS[status].hint}>
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS[status].color }} />
                  {STATUS[status].label}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{formatKm(km(status))} km</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {planned > 0 && (
            <>
              Do que o plano prevê nos trechos mapeados, <strong>{((built / planned) * 100).toFixed(1).replace(".", ",")}%</strong>{" "}
              já tem ciclovia (de qualquer tipologia).{" "}
            </>
          )}
          Projetos:{" "}
          {data.projects.map((p) => `${formatNumber(p.n)} ${STAGE_LABEL[p.stage].toLowerCase()}s`).join(", ")} (
          <Link to="/infra/projetos" className="underline">
            ver todos
          </Link>
          ).
          {data.lastRun && ` Última sincronização: ${new Date(data.lastRun.startedAt).toLocaleDateString("pt-BR")}.`}
          {data.removed > 0 && ` ${formatNumber(data.removed)} trechos saíram do OSM e não contam.`}
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por cidade (km)</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={cities}
              pageSize={20}
              filterPlaceholder="Buscar cidade..."
              initialSorting={[{ id: "executed", desc: true }]}
              toolbar={
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={onlyBuilt} onChange={(e) => setOnlyBuilt(e.target.checked)} />
                    Só com ciclovia executada
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={onlyPlan} onChange={(e) => setOnlyPlan(e.target.checked)} />
                    Só com projeto no PDC
                  </label>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
