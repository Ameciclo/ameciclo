import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Filter, MapPin, Search } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { cn } from "@ameciclo/ui/lib/utils";
import { SegmentPreviewMap } from "~/components/SegmentPreviewMap";
import { StepHeader } from "~/components/StepHeader";
import { HierarchyBadge, TypeBadge } from "~/components/TypeBadge";
import { validateAssessmentSearch } from "~/lib/assessment-search";
import { CLASSIFICATION_LABEL, CLASSIFICATIONS, SEGMENT_TYPES } from "~/lib/osm/types";
import { formatKm, SEGMENT_TYPE_COLOR } from "~/lib/segment-styles";
import { type SegmentItem, segmentDetailQueryOptions, workspaceQueryOptions } from "~/queries/assessment";

export const Route = createFileRoute("/avaliacao/escolher-estrutura")({
  validateSearch: validateAssessmentSearch,
  loaderDeps: ({ search }) => ({ cidade: search.cidade }),
  loader: ({ context: { queryClient }, deps }) => (deps.cidade ? queryClient.ensureQueryData(workspaceQueryOptions(deps.cidade)) : undefined),
  component: EscolherEstrutura,
});

const ALL = "todos";
const PAGE = 50;

function EscolherEstrutura() {
  const { cidade } = Route.useSearch();
  return (
    <>
      <StepHeader title="Escolher Estrutura" crumb="Escolher Estrutura" />
      <div className="container mx-auto px-4 pb-12">
        {cidade ? (
          <Structures cityId={cidade} />
        ) : (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle>Selecione uma cidade antes de continuar</CardTitle>
              <CardDescription>Esta etapa depende da cidade escolhida e dos trechos refinados na etapa anterior.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/avaliacao" search={{ cidade: undefined, trecho: undefined }}>
                  Voltar para Avaliação
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

const read = (value: string | number | null | undefined, suffix = "") => (value === undefined || value === null || value === "" ? "Não obtido ainda" : `${value}${suffix}`);

function technicalSummary(segment: SegmentItem) {
  const prefill = segment.prefill;
  return [
    { label: "Tipologia", value: read(prefill?.tipologia ?? segment.type) },
    { label: "Hierarquia viária", value: read(prefill?.hierarquia ?? (segment.classification ? CLASSIFICATION_LABEL[segment.classification] : "")) },
    { label: "Trecho início", value: read(prefill?.trechoInicio) },
    { label: "Trecho fim", value: read(prefill?.trechoFim) },
    { label: "Sentido", value: read(prefill?.sentido) },
    { label: "Posição na via", value: read(prefill?.posicaoNaVia) },
    { label: "Velocidade", value: read(prefill?.velocidade, prefill?.velocidade ? " km/h" : "") },
    { label: "Número de faixas", value: read(prefill?.numeroFaixas) },
    { label: "Pavimento", value: read(prefill?.pavimento) },
    { label: "Largura", value: read(prefill?.largura, prefill?.largura ? " m" : "") },
    { label: "Buffer / separação", value: read(prefill?.bufferSeparacao) },
    { label: "Quadras", value: read(segment.blocks) },
    { label: "Interseções", value: read(segment.intersections) },
  ];
}

function SelectedMap({ segment }: { segment: SegmentItem }) {
  const { data: detail } = useSuspenseQuery(segmentDetailQueryOptions(segment.id));
  if (!detail) return null;
  return <SegmentPreviewMap geometry={detail.geometry} color={SEGMENT_TYPE_COLOR[segment.type]} className="h-72 w-full" />;
}

function Structures({ cityId }: { cityId: string }) {
  const { trecho } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: workspace } = useSuspenseQuery(workspaceQueryOptions(cityId));

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [classification, setClassification] = useState(ALL);
  const [shown, setShown] = useState(PAGE);

  const segments = useMemo(
    () =>
      workspace.segments
        .filter((s) => s.parentId === null)
        .sort((a, b) => Number(a.evaluated) - Number(b.evaluated) || a.name.localeCompare(b.name, "pt-BR")),
    [workspace.segments],
  );

  const term = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = segments.filter(
    (s) =>
      (term === "" || [s.name, s.id, s.neighborhood ?? "", s.type, s.classification ?? ""].join(" ").toLocaleLowerCase("pt-BR").includes(term)) &&
      (status === ALL || (status === "avaliados" ? s.evaluated : !s.evaluated)) &&
      (type === ALL || s.type === type) &&
      (classification === ALL || s.classification === classification),
  );
  const active = search.trim() !== "" || status !== ALL || type !== ALL || classification !== ALL;
  const selected = segments.find((s) => s.id === trecho) ?? null;
  const evaluated = segments.filter((s) => s.evaluated).length;

  if (!workspace.city) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Esta cidade ainda não foi baixada</CardTitle>
          <CardDescription>Escolha-a em Avaliação para baixar os dados do OpenStreetMap.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const choose = (id: string) => navigate({ search: (previous) => ({ ...previous, trecho: id }), replace: true });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="mb-4 text-lg text-text-grey">Selecione o trecho que será avaliado em {workspace.city.name}/{workspace.city.state}.</p>
        <div className="mx-auto mb-4 flex max-w-fit items-center gap-3 rounded-full border border-ideciclo-teal/20 bg-ideciclo-teal/5 px-5 py-3 text-sm font-medium text-ideciclo-teal shadow-sm">
          <MapPin className="size-4" />
          <span>
            Cidade ativa: {workspace.city.name}, {workspace.city.state}
          </span>
        </div>
        <Button asChild variant="outline" className="rounded-full border-ideciclo-teal bg-white px-6 text-ideciclo-teal shadow-md">
          <Link to="/avaliacao" search={{ cidade: cityId, trecho: undefined }}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar às Etapas
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Trechos disponíveis", value: segments.length, tone: "text-ideciclo-blue", border: "border-ideciclo-blue/10" },
          { label: "Pendentes", value: segments.length - evaluated, tone: "text-emerald-600", border: "border-emerald-200" },
          { label: "Já avaliados", value: evaluated, tone: "text-amber-500", border: "border-amber-200" },
        ].map((card) => (
          <Card key={card.label} className={cn("rounded-[28px] shadow-sm", card.border)}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={cn("mt-2 text-3xl font-black", card.tone)}>{card.value.toLocaleString("pt-BR")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[32px] border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Estruturas Disponíveis em {workspace.city.name}</CardTitle>
          <CardDescription>Filtre a lista para localizar mais rápido o trecho certo e siga para o formulário com a seleção salva.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, ID, bairro ou tipologia" className="pl-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="avaliados">Avaliados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-48" aria-label="Tipologia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as tipologias</SelectItem>
                {SEGMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger className="w-44" aria-label="Hierarquia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as classes</SelectItem>
                {CLASSIFICATIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CLASSIFICATION_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!active}
              className="gap-2"
              onClick={() => {
                setSearch("");
                setStatus(ALL);
                setType(ALL);
                setClassification(ALL);
              }}
            >
              <Filter className="size-4" />
              Limpar
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              {filtered.length.toLocaleString("pt-BR")} de {segments.length.toLocaleString("pt-BR")} trechos visíveis
            </p>
            {selected ? (
              <p>
                Trecho selecionado: <span className="font-semibold text-foreground">{selected.name}</span>
              </p>
            ) : (
              <p>Selecione um trecho para habilitar o formulário.</p>
            )}
          </div>

          {segments.length === 0 ? (
            <div className="rounded-3xl border border-dashed px-6 py-8 text-center">
              <p className="font-medium">Nenhum trecho foi encontrado para esta cidade.</p>
              <p className="mt-2 text-sm text-muted-foreground">Volte para a etapa de refinamento e confirme se os trechos foram carregados corretamente.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed px-6 py-8 text-center">
              <p className="font-medium">Nenhum trecho corresponde aos filtros atuais.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.slice(0, shown).map((segment) => {
                const isSelected = selected?.id === segment.id;
                return (
                  <div
                    key={segment.id}
                    className={cn(
                      "w-full rounded-[28px] border p-5 text-left transition-all",
                      isSelected ? "border-emerald-300 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-ideciclo-teal/40 hover:shadow-sm",
                    )}
                  >
                    <button type="button" className="w-full text-left" onClick={() => void choose(segment.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={segment.evaluated ? "border-emerald-700 bg-emerald-700 text-white" : "border-rose-600 bg-rose-600 text-white"}>
                          {segment.evaluated ? "Avaliado" : "Pendente"}
                        </Badge>
                        <TypeBadge type={segment.type} />
                        <HierarchyBadge classification={segment.classification} />
                        {segment.isMerged && <Badge variant="outline">Mesclado</Badge>}
                        {isSelected && <Badge className="bg-emerald-600 text-white">Selecionado</Badge>}
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-foreground">{segment.name}</h4>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>ID: {segment.id}</span>
                        <span>Extensão: {formatKm(segment.km)} km</span>
                        {segment.neighborhood && <span>Bairro: {segment.neighborhood}</span>}
                        <span>Interseções: {segment.intersections ?? "-"}</span>
                        <span>Quadras: {segment.blocks ?? "-"}</span>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="mt-5 grid gap-5 border-t border-emerald-200 pt-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                        <div className="space-y-5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {technicalSummary(segment).map((item) => {
                              const missing = item.value === "Não obtido ainda";
                              return (
                                <div key={item.label} className={cn("rounded-2xl border px-4 py-3", missing ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-white")}>
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                                  <p className={cn("mt-2 text-sm font-semibold", missing ? "text-amber-800" : "text-slate-900")}>{item.value}</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button asChild className="gap-2">
                              <Link to="/avaliacao/formulario-ideciclo/$segmentId" params={{ segmentId: segment.id }}>
                                {segment.evaluated ? "Revisar avaliação" : "Avaliar com IDECICLO"}
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link to="/avaliacao/formulario-ideciclo/$segmentId" params={{ segmentId: segment.id }} search={{ step: "review" }}>
                                Revisão da Estrutura
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-[24px] border border-emerald-200 bg-white">
                          <Suspense fallback={<div className="h-72 w-full animate-pulse bg-muted" />}>
                            <SelectedMap segment={segment} />
                          </Suspense>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length > shown && (
                <Button variant="outline" onClick={() => setShown(shown + PAGE)}>
                  Mostrar mais ({(filtered.length - shown).toLocaleString("pt-BR")} restantes)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
