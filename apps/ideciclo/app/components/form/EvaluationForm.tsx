import { Link } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ameciclo/ui/components/alert";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Switch } from "@ameciclo/ui/components/switch";
import { Textarea } from "@ameciclo/ui/components/textarea";
import { CRITERION_CODES, type CriterionCode, isCriterionApplicable } from "~/lib/ideciclo/assessment";
import {
  blockCompletionStates,
  criterionAnchor,
  intersectionCompletionStates,
  isCriterionAnswered,
  isCriterionPinned,
} from "~/lib/ideciclo/criterion-state";
import { mapDirectionPrefillToInfraFlow, mapOsmSurfaceToPavementType, mapPositionPrefillToForm, resizeBlocks, resizeIntersections } from "~/lib/ideciclo/form-data";
import { parseLineGeometry } from "~/lib/ideciclo/segment-technical";
import { buildCriterionScorePreview } from "~/lib/ideciclo/score-preview";
import type { FormContext } from "~/queries/forms";
import "~/styles/ideciclo-form.css";
import AssessmentCriterionAccordion, { type CriterionPagerConfig } from "./AssessmentCriterionAccordion";
import { CriteriaAccordionContext, matchesCriterionFilter } from "./criteria-context";
import { CriteriaAccordionGroup } from "./CriteriaAccordionGroup";
import { A1Banner, AxisRibbon, EvaluationHeaderCard, SaveStatusSummary, StatusCards } from "./EvaluationFormHeader";
import { FormNavigationBar } from "./FormNavigationBar";
import { IndexedPager } from "./IndexedPager";
import { LinesMap } from "./LinesMap";
import DelimitationStep from "./steps/DelimitationStep";
import DesignQualityStep from "./steps/DesignQualityStep";
import PavementStep from "./steps/PavementStep";
import ReviewAndSubmitStep from "./steps/ReviewAndSubmitStep";
import SafetyAndComfortStep from "./steps/SafetyAndComfortStep";
import SignageStep from "./steps/SignageStep";
import TrafficConflictsStep from "./steps/TrafficConflictsStep";
import UrbanityStep from "./steps/UrbanityStep";
import { useEvaluationForm } from "./useEvaluationForm";
import { useFormViewState } from "./useFormViewState";

const TYPE_COLOR = { Ciclovia: "#3b82f6", Ciclofaixa: "#8b5cf6", Ciclorrota: "#10b981", Compartilhada: "#ef4444" } as const;

const scrollToId = (id: string, block: ScrollLogicalPosition) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });

export function EvaluationForm({ context, initialStep }: { context: FormContext; initialStep: 1 | 2 }) {
  const { formData, update, segment, scoreSummary, a1Decision, isOnline, lastLocalSaveAt, submit } = useEvaluationForm(context);
  const view = useFormViewState();

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [allowHierarchyEdit, setAllowHierarchyEdit] = useState(false);
  const [allowBlockEdit, setAllowBlockEdit] = useState(false);
  const [allowIntersectionEdit, setAllowIntersectionEdit] = useState(false);
  const [blockIndex, setBlockIndex] = useState(0);
  const [intersectionIndex, setIntersectionIndex] = useState(0);
  const [dismissedA1, setDismissedA1] = useState<string | null>(null);

  const originalRoadHierarchy = segment.classification ?? "";
  const prefill = segment.technical?.ideciclo_prefill ?? undefined;
  const typology = formData.infra_typology.toLowerCase();
  const isCiclorrota = typology.includes("ciclorrota");
  const isCalcada = typology.includes("compart") || typology.includes("calçada");
  const blockCount = formData.blocks_count;
  const intersectionCount = formData.intersections_count;
  // The pagers can be left pointing past the end after a removal.
  const currentBlock = Math.min(blockIndex, Math.max(blockCount - 1, 0));
  const currentIntersection = Math.min(intersectionIndex, Math.max(intersectionCount - 1, 0));

  // A.1 pending or incompatible sticks to the top, until dismissed for that exact verdict.
  const a1Signature = `${a1Decision.status}:${a1Decision.headline}:${a1Decision.detail}:${a1Decision.missingFields.join("|")}`;
  const a1Sticky = (a1Decision.status === "pending" || a1Decision.status === "incompatible") && dismissedA1 !== a1Signature;

  const criterionState = (code: CriterionCode) => ({
    applicable: isCriterionApplicable(formData, code),
    answered: isCriterionAnswered(formData, code, { a1Status: a1Decision.status, resolvedRating: scoreSummary.resolvedRatings[code] }),
    inAnalysis: isCriterionPinned(formData, code),
  });
  const applicable = CRITERION_CODES.map((code) => ({ code, ...criterionState(code) })).filter((item) => item.applicable);
  const incompleteCount = applicable.filter((item) => !item.answered).length;
  const pinnedCount = applicable.filter((item) => item.inAnalysis).length;
  const navigationCriteria = applicable
    .filter((item) => matchesCriterionFilter(view.filter, item))
    .map((item) => ({ ...item, a1Pending: item.code === "A1" && a1Decision.status === "pending", rating: scoreSummary.resolvedRatings[item.code] }));

  const changeBlockCount = (delta: number) => {
    const next = Math.max(1, blockCount + delta);
    if (next === blockCount) return;
    update(resizeBlocks(formData, next));
    setBlockIndex((current) => Math.min(current, next - 1));
  };
  const changeIntersectionCount = (delta: number) => {
    const next = Math.max(0, intersectionCount + delta);
    if (next === intersectionCount) return;
    update(resizeIntersections(formData, next));
    setIntersectionIndex((current) => Math.min(current, Math.max(next - 1, 0)));
  };

  const blockPager: CriterionPagerConfig = {
    count: blockCount,
    currentIndex: currentBlock,
    prefix: "Q",
    onSelect: setBlockIndex,
    label: "Quadra em edição",
    onAdd: () => changeBlockCount(1),
    onRemove: () => changeBlockCount(-1),
    canRemove: blockCount > 1,
  };
  const intersectionPager: CriterionPagerConfig = {
    count: intersectionCount,
    currentIndex: currentIntersection,
    prefix: "I",
    onSelect: setIntersectionIndex,
    label: "Interseção em edição",
    onAdd: () => changeIntersectionCount(1),
    onRemove: () => changeIntersectionCount(-1),
    canRemove: intersectionCount > 0,
  };

  const geometry = parseLineGeometry(segment.id ? context.segment.geometry : null);
  const trafficValues = isCiclorrota ? (["b12"] as const) : isCalcada ? (["b11"] as const) : (["b11", "b32"] as const);

  const submitting = submit.isPending;
  const saveButtonLabel = isOnline ? "Enviar Avaliação" : "Guardar Rascunho Offline";
  const saveButton = (size: "default" | "lg", variant: "default" | "outline") => (
    <Button onClick={() => submit.mutate()} disabled={submitting} variant={variant} size={size}>
      <Save className="mr-2 size-4" />
      {submitting ? "Enviando…" : saveButtonLabel}
    </Button>
  );

  const saveResult = submit.isSuccess ? (
    <Alert className="mb-6 border-emerald-300 bg-emerald-50 text-emerald-950">
      <AlertTitle>{submit.data.updated ? "Avaliação atualizada" : "Avaliação salva"}</AlertTitle>
      <AlertDescription>
        Nota calculada: {submit.data.total.toFixed(1)}/100.{" "}
        <Link to="/avaliacao/resultados" search={{ cidade: context.city.id }} className="font-semibold underline">
          Ver resultados da cidade
        </Link>
      </AlertDescription>
    </Alert>
  ) : submit.isError ? (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Falha no envio</AlertTitle>
      <AlertDescription>{submit.error.message || "Não foi possível salvar. O rascunho continua guardado neste aparelho."}</AlertDescription>
    </Alert>
  ) : null;

  const clearA1 = () => {
    setAllowHierarchyEdit(false);
    update({
      road_hierarchy: originalRoadHierarchy,
      classification: originalRoadHierarchy || undefined,
      infra_typology: segment.type,
      infra_flow: "unidirectional",
      position_on_road: "pista_calcada",
      velocity_kmh: 0,
      regulated_speed_choices: [],
      pedestrian_flow_per_hour_per_meter: 0,
      touched_fields: {
        infra_typology: false,
        infra_flow: false,
        position_on_road: false,
        velocity_kmh: false,
        regulated_speed_choices: false,
        road_hierarchy: false,
        pedestrian_flow_per_hour_per_meter: false,
      },
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {formData.segment_name || "Não informado"} ({formData.city || "Não informada"})
          </h2>
          <p className="text-muted-foreground">Formulário híbrido do IDECICLO em duas telas: coleta em campo e revisão final com override manual e rascunho offline.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/avaliacao">Voltar</Link>
        </Button>
      </div>

      <StatusCards isOnline={isOnline} total={scoreSummary.total} eliminated={scoreSummary.eliminated} lastLocalSaveAt={lastLocalSaveAt} />
      <A1Banner decision={a1Decision} sticky={a1Sticky} onDismiss={() => setDismissedA1(a1Signature)} />

      <Card className="mb-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Mapa do Trecho Avaliado</CardTitle>
          <CardDescription>Visualização do segmento selecionado para apoio ao preenchimento em campo.</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          {geometry ? (
            <LinesMap
              lines={[{ id: segment.id, geometry, color: TYPE_COLOR[segment.type] }]}
              fitKey={segment.id}
              className="h-[340px] w-full overflow-hidden rounded-[24px] border"
            />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed text-center text-muted-foreground">Mapa indisponível para este trecho.</div>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Navegação do formulário</div>
            <div className="mt-1 text-lg font-semibold">{step === 1 ? "Página 1 de 2 · Coleta em Campo" : "Página 2 de 2 · Revisão Final"}</div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={step === 1 ? "default" : "outline"} onClick={() => setStep(1)}>
                Coleta
              </Button>
              <Button type="button" variant={step === 2 ? "default" : "outline"} onClick={() => setStep(2)}>
                Revisão Final
              </Button>
              {saveButton("default", "outline")}
            </div>
            <SaveStatusSummary incompleteCount={incompleteCount} pinnedCount={pinnedCount} isOnline={isOnline} />
          </div>
        </div>
      </Card>

      {saveResult}
      <EvaluationHeaderCard data={formData} onChange={update} />

      {step === 1 ? (
        <CriteriaAccordionContext.Provider value={{ filter: view.filter, descriptionsVisible: view.descriptionsVisible, criterionMetaVisible: view.metaVisible }}>
          <div className="space-y-10 pb-28">
            <section id="section-a" className="space-y-6">
              <AxisRibbon tone="a" title="Caracterização do Trecho e Enquadramento Inicial" />
              <CriteriaAccordionGroup allValues={["a1"]} defaultOpenValues={["a1"]} filter={view.filter} command={view.command}>
                <AssessmentCriterionAccordion
                  value="a1"
                  title="A.1. Adequação da tipologia de tratamento em relação à velocidade da via e sua respectiva hierarquia"
                  description={a1Decision.detail}
                  scorePreview={buildCriterionScorePreview(formData, ["A1"])}
                  answered={a1Decision.status !== "pending"}
                  inAnalysis={formData.criterion_workflow_state?.a1 === "analysis"}
                  onAnalysisChange={(value) => update({ criterion_workflow_state: { ...formData.criterion_workflow_state, a1: value ? "analysis" : "default" } })}
                  onClear={clearA1}
                  helpKey="A1"
                >
                  <DesignQualityStep
                    data={formData}
                    onDataChange={update}
                    segmentType={segment.type}
                    originalRoadHierarchy={originalRoadHierarchy}
                    originalInfraFlow={mapDirectionPrefillToInfraFlow(prefill?.sentido)}
                    originalPositionOnRoad={mapPositionPrefillToForm(prefill?.posicaoNaVia)}
                    originalVelocityKmh={prefill?.velocidade ? Number(prefill.velocidade) : undefined}
                    allowHierarchyEdit={allowHierarchyEdit}
                    onHierarchyEditToggle={(checked) => {
                      setAllowHierarchyEdit(checked);
                      if (!checked) update({ road_hierarchy: originalRoadHierarchy, classification: originalRoadHierarchy || undefined });
                    }}
                    onHierarchySelection={(value) => update({ road_hierarchy: value, classification: value })}
                  />
                </AssessmentCriterionAccordion>
              </CriteriaAccordionGroup>
            </section>

            <section id="section-pavimento" className="space-y-6">
              <AxisRibbon tone="e" title="Pavimento, Identificação e Separação do Cicloviário" />
              <PavementStep
                data={formData}
                onDataChange={update}
                originalPavementType={mapOsmSurfaceToPavementType(segment.technical?.osm_tags?.surface, prefill?.pavimento)}
                originalPavementSource={segment.technical?.osm_tags?.surface || prefill?.pavimento}
                filter={view.filter}
                command={view.command}
              />
              <SignageStep data={formData} onDataChange={update} filter={view.filter} command={view.command} visibleValues={["b42", "e42"]} />
              <DelimitationStep data={formData} onDataChange={update} filter={view.filter} command={view.command} />
            </section>

            <section id="section-luz" className="space-y-6">
              <AxisRibbon tone="d" title="Iluminação e conforto térmico" />
              <UrbanityStep data={formData} onDataChange={update} filter={view.filter} command={view.command} visibleValues={["d1", "d2"]} />
            </section>

            <section id="section-risco" className="space-y-6">
              <AxisRibbon tone="b" title="Situações de risco" />
              <SafetyAndComfortStep data={formData} onDataChange={update} filter={view.filter} command={view.command} visibleValues={["b7"]} />
            </section>

            <section id="section-medicoes" className="space-y-6">
              <AxisRibbon tone="a" title="Medições da estrutura" />
              <TrafficConflictsStep
                data={formData}
                onDataChange={update}
                filter={view.filter}
                command={view.command}
                blockPager={blockPager}
                visibleValues={[...trafficValues]}
              />
            </section>

            <section id="section-quadras" className="space-y-6">
              <AxisRibbon tone="e" title="Avaliação das quadras" />
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Editar quadras</div>
                  <p className="text-xs text-slate-500">Ative para adicionar ou remover quadras pelo navegador.</p>
                </div>
                <Switch checked={allowBlockEdit} onCheckedChange={setAllowBlockEdit} />
              </div>
              <IndexedPager
                title="Quadra em edição"
                prefix="Q"
                count={blockCount}
                currentIndex={currentBlock}
                completion={blockCompletionStates(formData)}
                onSelect={setBlockIndex}
                showTitle={view.descriptionsVisible}
                editable={allowBlockEdit}
                onAdd={() => changeBlockCount(1)}
                onRemove={() => changeBlockCount(-1)}
                minCount={1}
              />
              <SignageStep
                data={formData}
                onDataChange={update}
                filter={view.filter}
                command={view.command}
                blockPager={blockPager}
                hideBlockPager
                visibleValues={isCiclorrota ? ["b43", "e43"] : ["b41", "e41"]}
              />
              <SafetyAndComfortStep
                data={formData}
                onDataChange={update}
                filter={view.filter}
                command={view.command}
                blockPager={blockPager}
                hideBlockPager
                currentIntersectionIndex={currentIntersection}
                visibleValues={["b5"]}
              />
              <UrbanityStep data={formData} onDataChange={update} filter={view.filter} command={view.command} blockPager={blockPager} hideBlockPager visibleValues={["d3"]} />
            </section>

            <section id="section-intersecoes" className="space-y-6">
              <AxisRibbon tone="c" title="Avaliação das interseções" />
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Editar interseções</div>
                  <p className="text-xs text-slate-500">Ative para adicionar ou remover interseções pelo navegador.</p>
                </div>
                <Switch checked={allowIntersectionEdit} onCheckedChange={setAllowIntersectionEdit} />
              </div>
              <IndexedPager
                title="Interseção em edição"
                prefix="I"
                count={intersectionCount}
                currentIndex={currentIntersection}
                completion={intersectionCompletionStates(formData)}
                onSelect={setIntersectionIndex}
                showTitle={view.descriptionsVisible}
                editable={allowIntersectionEdit}
                onAdd={() => changeIntersectionCount(1)}
                onRemove={() => changeIntersectionCount(-1)}
                minCount={0}
              />
              <SafetyAndComfortStep
                data={formData}
                onDataChange={update}
                filter={view.filter}
                command={view.command}
                intersectionPager={intersectionPager}
                hideIntersectionPager
                currentIntersectionIndex={currentIntersection}
                visibleValues={["a2", "c1", "e1", "c2", "c3"]}
              />
            </section>

            <section id="section-comentarios" className="space-y-4">
              <AxisRibbon tone="e" title="Comentários" />
              <Card>
                <CardHeader>
                  <CardTitle>Observações de campo</CardTitle>
                  <CardDescription>Registre contexto, justificativas, ressalvas ou qualquer detalhe importante da avaliação.</CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <Textarea
                    value={formData.observations}
                    onChange={(event) => update({ observations: event.target.value, touched_fields: { observations: event.target.value.trim().length > 0 } })}
                    placeholder="Ex.: interferências temporárias, dúvidas de classificação, condições do trecho no momento da visita..."
                    className="min-h-[140px]"
                  />
                </div>
              </Card>
            </section>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)} size="lg">
                Ir para a Revisão Final
              </Button>
            </div>

            <FormNavigationBar
              view={view}
              criteria={navigationCriteria}
              onSection={(id) => scrollToId(id, "start")}
              onCriterion={(code) => scrollToId(criterionAnchor(code, formData), "center")}
            />
          </div>
        </CriteriaAccordionContext.Provider>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Revisão Final</CardTitle>
            <CardDescription>Confira o conceito automático, veja o que foi considerado em cada critério e troque para o modo manual quando precisar ajustar algum conceito.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-2">
            <ReviewAndSubmitStep data={formData} onDataChange={update} />
          </div>
          <div className="flex flex-col gap-3 px-6 py-6 md:flex-row md:justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Voltar para a Coleta
            </Button>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <SaveStatusSummary incompleteCount={incompleteCount} pinnedCount={pinnedCount} isOnline={isOnline} />
              {saveButton("lg", "default")}
            </div>
          </div>
        </Card>
      )}

      {step === 1 ? (
        <Card className="mb-6">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">{isOnline ? "Enviar avaliação" : "Salvar rascunho"}</div>
              <div className="mt-1 text-lg font-semibold">{isOnline ? "Enviar avaliação atual" : "Guardar rascunho offline"}</div>
              <div className="mt-2">
                <SaveStatusSummary incompleteCount={incompleteCount} pinnedCount={pinnedCount} isOnline={isOnline} />
              </div>
            </div>
            {saveButton("lg", "default")}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
