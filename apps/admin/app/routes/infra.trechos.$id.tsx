import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lock, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { AdminTopbar } from "~/components/AdminTopbar";
import { StatusLegend, WaysMap } from "~/components/WaysMap";
import { formatKm, isWayStatus, STATUS } from "~/lib/infra";
import { infraQueryKey, saveWay, wayQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/trechos/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const detail = await queryClient.ensureQueryData(wayQueryOptions(Number(params.id)));
    if (!detail) throw notFound();
  },
  component: TrechoDetalhe,
});

function TrechoDetalhe() {
  const { id } = Route.useParams();
  const { data: detail } = useSuspenseQuery(wayQueryOptions(Number(id)));
  const queryClient = useQueryClient();

  const [cityIbge, setCityIbge] = useState(detail?.way.cityIbge ?? null);
  // Links added here; the ones from the import are shown locked.
  const [manualIds, setManualIds] = useState(detail?.links.filter((l) => l.manual).map((l) => l.projectId) ?? []);
  const [message, setMessage] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => saveWay({ data: { id: Number(id), cityIbge, projectIds: manualIds } }),
    onSuccess: async () => {
      setMessage("Salvo.");
      await queryClient.invalidateQueries({ queryKey: infraQueryKey });
    },
  });

  if (!detail) return null;
  const { way, links, projects } = detail;
  const importedIds = new Set(links.filter((l) => !l.manual).map((l) => l.projectId));
  const label = (projectId: number) => projects.find((p) => p.id === projectId)?.label ?? String(projectId);
  const candidates = projects.filter((p) => !importedIds.has(p.id) && !manualIds.includes(p.id));

  return (
    <>
      <AdminTopbar
        title={way.name ?? `Trecho ${way.osmId}`}
        description={`way/${way.osmId} · ${formatKm(way.km)} km${way.highway ? ` · ${way.highway}` : ""}`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/infra/trechos" search={{ agrupar: true, q: "" }}>
              <ArrowLeft className="size-4" />
              Todos os trechos
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <StatusLegend />
              <WaysMap ways={detail.map} className="h-[28rem] w-full rounded-md border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plano e cidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {isWayStatus(way.status) ? (
                  <Badge variant="outline" className="gap-1.5" title={STATUS[way.status].hint}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: STATUS[way.status].color }} />
                    {STATUS[way.status].label}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem status</Badge>
                )}
                <span className="text-muted-foreground">Construído: {way.built ?? "sem ciclovia"}</span>
              </div>

              <div className="space-y-1">
                <Label>Cidade{way.cityManual && " (definida aqui)"}</Label>
                <Select value={cityIbge === null ? "" : String(cityIbge)} onValueChange={(v) => setCityIbge(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {detail.cities.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Projetos do PDC</Label>
                <ul className="space-y-1 text-sm">
                  {links
                    .filter((l) => !l.manual)
                    .map((l) => (
                      <li key={l.projectId} className="flex items-center gap-2 rounded border bg-muted/40 px-2 py-1">
                        <Lock className="size-3.5 text-muted-foreground" aria-label="Vem do OpenStreetMap" />
                        <Link to="/infra/projetos/$id" params={{ id: String(l.projectId) }} className="hover:underline">
                          {l.ref} · {l.name}
                        </Link>
                        <span className="ml-auto text-xs text-muted-foreground">{l.typology}</span>
                      </li>
                    ))}
                  {manualIds.map((projectId) => (
                    <li key={projectId} className="flex items-center gap-2 rounded border px-2 py-1">
                      <span className="min-w-0 flex-1 truncate">{label(projectId)}</span>
                      <button
                        type="button"
                        aria-label="Remover vínculo"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setManualIds(manualIds.filter((p) => p !== projectId))}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                  {links.length === 0 && manualIds.length === 0 && <li className="text-muted-foreground">Fora do plano.</li>}
                </ul>
                <Select value="" onValueChange={(v) => setManualIds([...manualIds, Number(v)])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a um projeto…" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Vínculos do OpenStreetMap (cadeado) não saem daqui: mudam no OSM. Os que você adiciona ficam e não são removidos pela sincronização.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  {save.isPending ? "Salvando…" : "Salvar"}
                </Button>
                {message && <span className="text-sm text-muted-foreground">{message}</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags do OpenStreetMap ({Object.keys(way.tags).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(way.tags)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <dt className="font-mono text-xs text-muted-foreground">{key}</dt>
                    <dd className="min-w-0 truncate" title={value}>
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
