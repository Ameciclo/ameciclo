import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { buildNewDocument, TOPOLOGY_APPROACHES } from "@ameciclo/db/document";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@ameciclo/ui/components/toggle-group";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DatePicker } from "~/components/DatePicker";
import { MovementDiagram } from "@ameciclo/ui/components/movement-diagram";
import { TOPOLOGY_LABEL } from "~/lib/format";
import { failureMessage } from "~/lib/save-errors";
import { contagemQueryKeys, createContagem, localsQueryOptions } from "~/queries/contagens";

export const Route = createFileRoute("/contagens/nova")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(localsQueryOptions()),
  component: NewContagemPage,
});

type Topology = keyof typeof TOPOLOGY_APPROACHES;

function isTopology(v: string): v is Topology {
  return v in TOPOLOGY_APPROACHES;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 text-sm">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function NewContagemPage() {
  const { data: locals } = useSuspenseQuery(localsQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [localMode, setLocalMode] = useState<"existing" | "new">("existing");
  const [localId, setLocalId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState("");
  const [variant, setVariant] = useState("");
  const [startHour, setStartHour] = useState(6);
  const [endHour, setEndHour] = useState(20);
  const [bucketMinutes, setBucketMinutes] = useState(60);
  const [topology, setTopology] = useState<Topology>("crossroad");
  const [approaches, setApproaches] = useState<string[]>(["", "", "", ""]);
  const [reportUrl, setReportUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const count = TOPOLOGY_APPROACHES[topology];
  const toNumber = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));

  const problems = [
    localMode === "existing" && localId === null ? "Escolha o local." : null,
    localMode === "new" && !newName.trim() ? "Informe o nome do novo local." : null,
    !date ? "Informe a data." : null,
    endHour <= startHour ? "O término precisa ser depois do início." : null,
    approaches.slice(0, count).some((a) => !a.trim()) ? "Dê um nome a cada aproximação." : null,
  ].filter((p): p is string => p !== null);

  const create = useMutation({
    mutationFn: () =>
      createContagem({
        data: {
          doc: buildNewDocument({
            localId: localId ?? 0,
            date,
            variant: variant.trim() || null,
            startHour,
            endHour,
            bucketMinutes,
            topology,
            approaches: approaches.slice(0, count).map((a) => a.trim()),
            reportUrl: reportUrl.trim() || null,
          }),
          newLocal:
            localMode === "new"
              ? { name: newName.trim(), latitude: toNumber(latitude), longitude: toNumber(longitude) }
              : null,
        },
      }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(failureMessage(result));
        return;
      }
      await Promise.all(contagemQueryKeys(result.id).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      await navigate({ to: "/contagens/$id", params: { id: String(result.id) }, search: { editar: true } });
    },
  });

  return (
    <>
      <AdminTopbar
        title="Nova contagem"
        description="Crie o rascunho e preencha os números na tela seguinte."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/contagens">Cancelar</Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={localMode}
              onValueChange={(v) => {
                if (v === "existing" || v === "new") setLocalMode(v);
              }}
            >
              <ToggleGroupItem value="existing">Selecionar existente</ToggleGroupItem>
              <ToggleGroupItem value="new">Novo local</ToggleGroupItem>
            </ToggleGroup>
            {localMode === "existing" ? (
              <Field id="new-local" label="Ponto de contagem">
                <Select value={localId === null ? "" : String(localId)} onValueChange={(v) => setLocalId(Number(v))}>
                  <SelectTrigger id="new-local">
                    <SelectValue placeholder="Selecione um ponto de contagem…" />
                  </SelectTrigger>
                  <SelectContent>
                    {locals.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <Field id="new-name" label="Nome">
                    <Input id="new-name" value={newName} placeholder="Ex.: Av. Caxangá com Rua Cosme Viana" onChange={(e) => setNewName(e.target.value)} />
                  </Field>
                </div>
                <Field id="new-lat" label="Latitude (opcional)">
                  <Input id="new-lat" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                </Field>
                <Field id="new-lng" label="Longitude (opcional)">
                  <Input id="new-lng" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessão de contagem</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="new-date" label="Data">
              <DatePicker id="new-date" value={date} onChange={setDate} />
            </Field>
            <Field id="new-start" label="Início (hora)">
              <Input id="new-start" type="number" min={0} max={23} value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} />
            </Field>
            <Field id="new-end" label="Término (hora)">
              <Input id="new-end" type="number" min={1} max={24} value={endHour} onChange={(e) => setEndHour(Number(e.target.value))} />
            </Field>
            <Field id="new-bucket" label="Intervalo">
              <Select value={String(bucketMinutes)} onValueChange={(v) => setBucketMinutes(Number(v))}>
                <SelectTrigger id="new-bucket">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="new-variant" label="Variante (opcional)">
              <Input id="new-variant" value={variant} placeholder="ex.: Pista Leste" onChange={(e) => setVariant(e.target.value)} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field id="new-report" label="Link do relatório (opcional)">
                <Input id="new-report" value={reportUrl} onChange={(e) => setReportUrl(e.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topologia e aproximações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={topology}
              onValueChange={(v) => {
                if (isTopology(v)) setTopology(v);
              }}
            >
              {(Object.keys(TOPOLOGY_APPROACHES) as Topology[]).map((t) => (
                <ToggleGroupItem key={t} value={t}>
                  {TOPOLOGY_LABEL[t]} · {TOPOLOGY_APPROACHES[t]} aproximações
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid content-start gap-4 sm:grid-cols-2">
                {Array.from({ length: count }, (_, i) => (
                  <Field key={i} id={`new-approach-${i}`} label={`Aproximação ${i + 1}`}>
                    <Input
                      id={`new-approach-${i}`}
                      value={approaches[i] ?? ""}
                      onChange={(e) => setApproaches((prev) => Array.from({ length: 4 }, (_, j) => (j === i ? e.target.value : (prev[j] ?? ""))))}
                    />
                  </Field>
                ))}
              </div>
              <div className="flex justify-center rounded-md border bg-muted/30 p-3">
                <MovementDiagram topology={topology} approaches={approaches.slice(0, count)} flows={{}} />
              </div>
            </div>
          </CardContent>
        </Card>

        {(problems.length > 0 || error) && (
          <p className="text-sm text-destructive">{error ?? problems.join(" ")}</p>
        )}
        <div className="flex justify-end">
          <Button disabled={problems.length > 0 || create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? "Criando..." : "Criar rascunho"}
          </Button>
        </div>
      </div>
    </>
  );
}
