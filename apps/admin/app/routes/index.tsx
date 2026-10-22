import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { formatDate, formatNumber } from "~/lib/format";
import { characteristicsQueryOptions, contagensQueryOptions, localsQueryOptions } from "~/queries/contagens";

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(contagensQueryOptions()),
      queryClient.ensureQueryData(localsQueryOptions()),
      queryClient.ensureQueryData(characteristicsQueryOptions()),
    ]);
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: contagens } = useSuspenseQuery(contagensQueryOptions());
  const { data: locals } = useSuspenseQuery(localsQueryOptions());
  const { data: characteristics } = useSuspenseQuery(characteristicsQueryOptions());
  const projected = contagens.filter((c) => c.isProjected).length;
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
        <AttentionPanel contagens={contagens} locals={locals} unmapped={characteristics.unmapped.length} />
        <div className="grid gap-4 lg:grid-cols-2">
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

const STALE_AFTER_YEARS = 3;
const LIST_LIMIT = 6;

type AttentionContagem = {
  id: number;
  localName: string;
  date: string;
  status: string;
  warnings: number;
  positionsMissing: boolean;
};

type AttentionLocal = { id: number; name: string; lastDate: string | null };

// What an editor should look at next: drafts, open issues, missing positions and places not counted for years.
function AttentionPanel({
  contagens,
  locals,
  unmapped,
}: {
  contagens: AttentionContagem[];
  locals: AttentionLocal[];
  unmapped: number;
}) {
  const drafts = contagens.filter((c) => c.status === "draft");
  const withIssues = contagens.filter((c) => c.warnings > 0).sort((a, b) => b.warnings - a.warnings);
  const noPositions = contagens.filter((c) => c.positionsMissing);
  const staleYear = new Date().getFullYear() - STALE_AFTER_YEARS;
  const stale = locals
    .filter((l) => l.lastDate !== null && Number(l.lastDate.slice(0, 4)) <= staleYear)
    .sort((a, b) => (a.lastDate ?? "").localeCompare(b.lastDate ?? ""));

  const countLink = (c: AttentionContagem, hint: string) => (
    <li key={c.id} className="flex justify-between gap-3">
      <Link to="/contagens/$id" params={{ id: String(c.id) }} className="truncate underline-offset-4 hover:underline">
        {c.localName} · {formatDate(c.date)}
      </Link>
      <span className="shrink-0 text-muted-foreground">{hint}</span>
    </li>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AttentionCard title="Rascunhos para publicar" total={drafts.length} empty="Nenhum rascunho pendente.">
        {drafts.slice(0, LIST_LIMIT).map((c) => countLink(c, "rascunho"))}
      </AttentionCard>
      <AttentionCard title="Pendências abertas" total={withIssues.length} empty="Nenhuma pendência aberta.">
        {withIssues.slice(0, LIST_LIMIT).map((c) => countLink(c, `${c.warnings} ${c.warnings === 1 ? "aviso" : "avisos"}`))}
      </AttentionCard>
      <AttentionCard title="Sem posição das aproximações" total={noPositions.length} empty="Todas têm posição.">
        {noPositions.slice(0, LIST_LIMIT).map((c) => countLink(c, "definir"))}
      </AttentionCard>
      <AttentionCard
        title={`Locais sem contagem há ${STALE_AFTER_YEARS}+ anos`}
        total={stale.length}
        empty="Todos os locais foram contados recentemente."
      >
        {stale.slice(0, LIST_LIMIT).map((l) => (
          <li key={l.id} className="flex justify-between gap-3">
            <span className="truncate">{l.name}</span>
            <span className="shrink-0 text-muted-foreground">{formatDate(l.lastDate)}</span>
          </li>
        ))}
      </AttentionCard>
      {unmapped > 0 && (
        <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
          {formatNumber(unmapped)} rótulos de características sem mapeamento.{" "}
          <Link to="/caracteristicas" className="underline underline-offset-4">
            Revisar
          </Link>
        </p>
      )}
    </div>
  );
}

function AttentionCard({
  title,
  total,
  empty,
  children,
}: {
  title: string;
  total: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-baseline justify-between gap-2 text-base">
          {title}
          <span className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">{children}</ul>
        )}
        {total > LIST_LIMIT && <p className="mt-2 text-xs text-muted-foreground">e mais {total - LIST_LIMIT}.</p>}
      </CardContent>
    </Card>
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
