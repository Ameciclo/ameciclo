import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { formatDate, formatNumber } from "~/lib/format";
import { listCharacteristics, listContagens, listLocals } from "~/queries/contagens";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [contagens, locals, characteristics] = await Promise.all([
      listContagens(),
      listLocals(),
      listCharacteristics(),
    ]);
    return { contagens, locals, characteristics };
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { contagens, locals, characteristics } = Route.useLoaderData();
  const projected = contagens.filter((c) => c.isProjected).length;
  const withWarnings = contagens.filter((c) => c.warnings > 0).length;
  const total = contagens.reduce((sum, c) => sum + (c.totalCyclists ?? 0), 0);
  const dates = contagens.map((c) => c.date).sort();

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        description="Visão geral das contagens importadas."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/contagens">
              Ver contagens
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Contagens" value={formatNumber(contagens.length)} hint={`${formatDate(dates[0] ?? null)} a ${formatDate(dates.at(-1) ?? null)}`} />
          <Stat label="Locais" value={formatNumber(locals.length)} />
          <Stat label="Ciclistas contados" value={formatNumber(total)} hint="soma dos totais registrados" />
          <Stat label="Estimadas" value={formatNumber(projected)} hint="contagens com projeção" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Para revisar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>{formatNumber(withWarnings)}</strong> contagens com avisos de importação.
              </p>
              <p>
                <strong>{formatNumber(characteristics.unmapped.length)}</strong> rótulos de características sem mapeamento.{" "}
                <Link to="/caracteristicas" className="underline underline-offset-4">
                  Revisar
                </Link>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mais recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {contagens.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex justify-between gap-3">
                    <Link to="/contagens/$id" params={{ id: String(c.id) }} className="truncate underline-offset-4 hover:underline">
                      {c.localName}
                    </Link>
                    <span className="shrink-0 text-muted-foreground">{formatDate(c.date)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
