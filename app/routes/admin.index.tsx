import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Users2, ArrowRight } from "lucide-react";
import { AdminTopbar } from "~/components/Admin/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { contagensQueryOptions } from "~/queries/dados.contagens";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";

export const Route = createFileRoute("/admin/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(contagensQueryOptions()),
  component: AdminDashboard,
  pendingComponent: () => <RouteLoading label="Carregando admin..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function AdminDashboard() {
  const { data: { summaryData } } = useSuspenseQuery(contagensQueryOptions());
  const { summaryData: stats, countsData } = summaryData;

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        description="Visão geral dos dados gerenciáveis pela Ameciclo."
      />
      <div className="flex-1 px-6 py-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Pontos de contagem" value={stats.different_counts_points} />
          <StatCard label="Contagens registradas" value={stats.number_counts} />
          <StatCard label="Ciclistas contados" value={stats.total_cyclists.toLocaleString("pt-BR")} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users2 className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Contagens de ciclistas</CardTitle>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/contagens">
                Gerenciar
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {countsData.length.toLocaleString("pt-BR")} registros disponíveis para
              consulta e edição.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
