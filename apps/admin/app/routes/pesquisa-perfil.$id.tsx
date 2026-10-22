import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { BarList } from "~/components/BarList";
import { PointsMap } from "~/components/PointsMap";
import { formatNumber } from "~/lib/format";
import { profileSurveyQueryOptions } from "~/queries/pesquisa-perfil";

export const Route = createFileRoute("/pesquisa-perfil/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const detail = await queryClient.ensureQueryData(profileSurveyQueryOptions(Number(params.id)));
    if (!detail) throw notFound();
  },
  component: PesquisaDetalhe,
});

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const oneDecimal = (v: number | null) => (v === null ? "—" : decimal.format(v));

function PesquisaDetalhe() {
  const { id } = Route.useParams();
  const { data: detail } = useSuspenseQuery(profileSurveyQueryOptions(Number(id)));
  if (!detail) return null;
  const { survey, stats, interviews, flags, distributions, days, siblings, points } = detail;
  const daysAnswered = days.reduce((sum, d) => sum + d.n, 0);

  return (
    <>
      <AdminTopbar
        title={`${survey.city} · ${survey.year}`}
        description={`${formatNumber(interviews)} entrevistas. Percentuais calculados sobre quem respondeu cada pergunta.`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/pesquisa-perfil">
              <ArrowLeft className="size-4" />
              Todas as pesquisas
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        {siblings.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Outras edições em {survey.city}:</span>
            {siblings.map((s) =>
              s.id === survey.id ? (
                <span key={s.id} className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground">
                  {s.year}
                </span>
              ) : (
                <Link
                  key={s.id}
                  to="/pesquisa-perfil/$id"
                  params={{ id: String(s.id) }}
                  className="rounded-md border bg-background px-2.5 py-1 hover:bg-accent"
                >
                  {s.year}
                </Link>
              ),
            )}
          </div>
        )}

        {survey.notes && (
          <p className="rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            <span className="font-medium">Como esta edição difere das outras: </span>
            {survey.notes}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Idade média" value={oneDecimal(stats.ageAvg)} hint={stats.ageMedian === null ? undefined : `mediana ${oneDecimal(stats.ageMedian)}`} />
          <Stat label="Trajeto (min)" value={oneDecimal(stats.tripAvg)} hint={stats.tripMedian === null ? undefined : `mediana ${oneDecimal(stats.tripMedian)}`} />
          <Stat label="Dias por semana" value={oneDecimal(stats.daysAvg)} hint="de bicicleta como transporte" />
          <Stat
            label="Com data ou ponto"
            value={`${formatNumber(stats.withDate)} / ${formatNumber(stats.withPoint)}`}
            hint="entrevistas com data conhecida / com ponto de coleta"
          />
        </div>

        {flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perguntas de sim ou não</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Pergunta</th>
                    <th className="px-3 py-2 text-right font-medium">Sim</th>
                    <th className="px-3 py-2 text-right font-medium">Não</th>
                    <th className="px-3 py-2 text-right font-medium">% sim</th>
                    <th className="px-3 py-2 text-right font-medium">Sem resposta</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.key} className="border-b last:border-0">
                      <td className="py-2 pr-4">{f.label}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatNumber(f.yes)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatNumber(f.no)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {decimal.format((100 * f.yes) / (f.yes + f.no))}%
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatNumber(f.unknown)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {points.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pontos de entrevista</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatNumber(points.length)} pontos. O tamanho do círculo é o número de entrevistas feitas ali; clique em um ponto para ver o nome.
              </p>
            </CardHeader>
            <CardContent>
              <PointsMap points={points} className="h-96 w-full overflow-hidden rounded-md border" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {days.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dias por semana que pedala</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList rows={days.map((d) => ({ label: `${d.days} ${d.days === 1 ? "dia" : "dias"}`, n: d.n }))} answered={daysAnswered} />
              </CardContent>
            </Card>
          )}
          {distributions.map((d) => (
            <Card key={d.column}>
              <CardHeader>
                <CardTitle className="text-base">{d.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(d.answered)} respostas
                  {interviews > d.answered && ` · ${formatNumber(interviews - d.answered)} sem resposta`}
                </p>
              </CardHeader>
              <CardContent>
                <BarList rows={d.rows} answered={d.answered} />
              </CardContent>
            </Card>
          ))}
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
