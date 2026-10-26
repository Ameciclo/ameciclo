import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { AdminTopbar } from "~/components/AdminTopbar";
import { CheckList } from "~/components/CheckList";
import { StatusBar } from "~/components/StatusBar";
import { StatusLegend, WaysMap } from "~/components/WaysMap";
import { formatKm, isWayStatus } from "~/lib/infra";
import { deleteStretch, infraQueryKey, saveStretch, type StretchWay, stretchQueryOptions } from "~/queries/infra";

export const Route = createFileRoute("/infra/trechos/trecho/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const detail = await queryClient.ensureQueryData(stretchQueryOptions(Number(params.id)));
    if (!detail) throw notFound();
  },
  component: TrechoDaRua,
});

const wayLabel = (w: StretchWay) => `${w.name ?? `sem nome · ${w.osmId}`}${w.highway ? ` · ${w.highway}` : ""} · ${formatKm(w.km)} km`;

function TrechoDaRua() {
  const { id } = Route.useParams();
  const { data: detail } = useSuspenseQuery(stretchQueryOptions(Number(id)));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = useState(detail?.stretch.name ?? "");
  const [wayIds, setWayIds] = useState(detail?.ways.map((w) => w.id) ?? []);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: () => saveStretch({ data: { id: Number(id), name, wayIds } }),
    onSuccess: async (result) => {
      setMessage(result.ok ? { ok: true, text: "Salvo." } : { ok: false, text: result.problems.join(" ") });
      if (result.ok) await queryClient.invalidateQueries({ queryKey: infraQueryKey });
    },
  });
  const undo = useMutation({
    mutationFn: () => deleteStretch({ data: { id: Number(id) } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: infraQueryKey });
      await navigate({ to: "/infra/trechos", search: { agrupar: true, q: "" } });
    },
  });

  if (!detail) return null;
  const options = [...detail.ways, ...detail.nearby].map((w) => ({ id: w.id, label: wayLabel(w) }));
  const byStatus = { pdc_realizado_designado: 0, pdc_realizado_nao_designado: 0, realizado_fora_pdc: 0, pdc_nao_realizado: 0 };
  for (const w of detail.ways) if (isWayStatus(w.status)) byStatus[w.status] += w.km;
  const km = detail.ways.reduce((sum, w) => sum + w.km, 0);

  return (
    <>
      <AdminTopbar
        title={detail.stretch.name}
        description={`${detail.ways.length} segmentos · ${formatKm(km)} km${detail.stretch.city ? ` · ${detail.stretch.city}` : ""}`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/infra/trechos" search={{ agrupar: true, q: "" }}>
              <ArrowLeft className="size-4" />
              Todos os trechos
            </Link>
          </Button>
        }
      />
      <div className="grid flex-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="self-start">
          <CardContent className="space-y-3 pt-6">
            <StatusLegend />
            <WaysMap ways={detail.map} className="h-[32rem] w-full rounded-md border" />
            <StatusBar km={byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Composição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="stretch-name">Nome</Label>
              <Input id="stretch-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <CheckList
              legend={`Segmentos (${wayIds.length} marcados). Os de baixo estão a menos de 300 m e sem trecho.`}
              options={options}
              selected={wayIds}
              onChange={setWayIds}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Salvando…" : "Salvar"}
              </Button>
              <Button variant="outline" onClick={() => undo.mutate()} disabled={undo.isPending}>
                Desfazer trecho
              </Button>
              {message && <span className={`text-sm ${message.ok ? "text-muted-foreground" : "text-destructive"}`}>{message.text}</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              Desfazer devolve os segmentos à lista solta; nada do plano ou do OpenStreetMap é apagado. A sincronização não mexe na composição.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
