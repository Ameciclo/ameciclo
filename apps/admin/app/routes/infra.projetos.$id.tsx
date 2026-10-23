import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { Textarea } from "@ameciclo/ui/components/textarea";
import { AdminTopbar } from "~/components/AdminTopbar";
import { CheckList } from "~/components/CheckList";
import { StatusLegend, WaysMap } from "~/components/WaysMap";
import { formatKm, isWayStatus, STAGE_LABEL, STAGES, STATUS, type Stage } from "~/lib/infra";
import { infraQueryKey, projectQueryOptions, saveProject } from "~/queries/infra";

export const Route = createFileRoute("/infra/projetos/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const detail = await queryClient.ensureQueryData(projectQueryOptions(Number(params.id)));
    if (!detail) throw notFound();
  },
  component: ProjetoDetalhe,
});

function isStage(value: string): value is Stage {
  return STAGES.some((s) => s === value);
}

function ProjetoDetalhe() {
  const { id } = Route.useParams();
  const { data: detail } = useSuspenseQuery(projectQueryOptions(Number(id)));
  const queryClient = useQueryClient();
  const initial = detail?.project;

  const [name, setName] = useState(initial?.name ?? "");
  const [typologyKey, setTypologyKey] = useState(initial?.typologyKey ?? "");
  const [stage, setStage] = useState<Stage>(initial?.stage ?? "proposed");
  const [stretch, setStretch] = useState(initial?.stretch ?? "");
  const [plannedKm, setPlannedKm] = useState(initial?.plannedKm?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [agencyIds, setAgencyIds] = useState(initial?.agencyIds ?? []);
  const [cityIds, setCityIds] = useState(initial?.cityIds ?? []);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: () =>
      saveProject({
        data: {
          id: Number(id),
          name,
          typologyKey,
          stage,
          stretch: stretch || null,
          plannedKm: plannedKm.trim() === "" ? null : Number(plannedKm.replace(",", ".")),
          notes: notes || null,
          agencyIds,
          cityIds,
        },
      }),
    onSuccess: async (result) => {
      setMessage(result.ok ? { ok: true, text: "Salvo." } : { ok: false, text: result.problems.join(" ") });
      if (result.ok) await queryClient.invalidateQueries({ queryKey: infraQueryKey });
    },
  });

  if (!detail || !initial) return null;
  const mappedKm = detail.ways.reduce((sum, w) => sum + w.km, 0);

  return (
    <>
      <AdminTopbar
        title={`${initial.ref} · ${initial.name}`}
        description={
          initial.osmRelationId
            ? `Relação ${initial.osmRelationId} no OpenStreetMap. ${formatKm(mappedKm)} km mapeados em ${detail.ways.length} trechos.`
            : `${formatKm(mappedKm)} km mapeados em ${detail.ways.length} trechos.`
        }
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/infra/projetos">
              <ArrowLeft className="size-4" />
              Todos os projetos
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do projeto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="grid content-start gap-4">
              <div className="space-y-1">
                <Label htmlFor="p-name">Nome</Label>
                <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Tipologia prevista</Label>
                  <Select value={typologyKey} onValueChange={setTypologyKey}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {detail.typologies.map((t) => (
                        <SelectItem key={t.key} value={t.key}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Estágio</Label>
                  <Select value={stage} onValueChange={(v) => isStage(v) && setStage(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STAGE_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-km">Previsto (km)</Label>
                  <Input id="p-km" inputMode="decimal" value={plannedKm} onChange={(e) => setPlannedKm(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-stretch">Trecho</Label>
                <Input id="p-stretch" value={stretch} onChange={(e) => setStretch(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-notes">Observações</Label>
                <Textarea id="p-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <CheckList legend="Responsável" options={detail.agencies} selected={agencyIds} onChange={setAgencyIds} />
              <CheckList legend="Cidades" options={detail.cities} selected={cityIds} onChange={setCityIds} />
            </div>
          </CardContent>
          <CardContent className="flex items-center gap-3 pt-0">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
            {message && <span className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>{message.text}</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trechos do projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusLegend />
            <WaysMap ways={detail.map} />
            <ul className="divide-y rounded-md border bg-background text-sm">
              {detail.ways.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <Link to="/infra/trechos/$id" params={{ id: String(w.id) }} className="min-w-0 truncate hover:underline">
                    {w.name ?? `Trecho ${w.osmId}`}
                  </Link>
                  <span className="flex shrink-0 items-center gap-3">
                    {isWayStatus(w.status) && <Badge variant="outline">{STATUS[w.status].label}</Badge>}
                    <span className="tabular-nums text-muted-foreground">{formatKm(w.km)} km</span>
                  </span>
                </li>
              ))}
              {detail.ways.length === 0 && <li className="px-3 py-6 text-center text-muted-foreground">Nenhum trecho mapeado.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
