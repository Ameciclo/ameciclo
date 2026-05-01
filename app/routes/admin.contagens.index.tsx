import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AdminTopbar } from "~/components/Admin/AdminTopbar";
import { ContagensTable, type ContagemRow } from "~/components/Admin/ContagensTable";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { contagensQueryOptions } from "~/queries/dados.contagens";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/admin/contagens/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(contagensQueryOptions()),
  head: () =>
    seo({
      title: "Admin · Contagens - Ameciclo",
      description: "Gestão das contagens de ciclistas registradas pela Ameciclo.",
      pathname: "/admin/contagens",
      noindex: true,
    }),
  component: AdminContagens,
  pendingComponent: () => <RouteLoading label="Carregando contagens..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function AdminContagens() {
  const { data: { summaryData } } = useSuspenseQuery(contagensQueryOptions());
  const rows = summaryData.countsData as ContagemRow[];

  return (
    <>
      <AdminTopbar
        title="Contagens"
        description="Gestão das contagens de ciclistas registradas pela Ameciclo."
        actions={
          <Button asChild size="sm">
            <Link to="/admin/contagens/nova">
              <Plus className="size-4" />
              Nova contagem
            </Link>
          </Button>
        }
      />
      <div className="flex-1 px-6 py-6">
        <ContagensTable rows={rows} />
      </div>
    </>
  );
}
