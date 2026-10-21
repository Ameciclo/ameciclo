import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "~/components/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";

export const Route = createFileRoute("/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <AdminTopbar
        title="Dashboard"
        description="Visão geral dos dados gerenciáveis pela Ameciclo."
      />
      <div className="flex-1 px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Em construção</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As seções de gestão entram aqui conforme os dados migram para o banco.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
