import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ameciclo/ui/components/alert";
import { Button } from "@ameciclo/ui/components/button";
import { AutoMergePanel } from "~/components/AutoMergePanel";
import { CityInfrastructureCard } from "~/components/CityInfrastructureCard";
import { MergeSegmentsDialog } from "~/components/MergeSegmentsDialog";
import { SegmentEditPanel } from "~/components/SegmentEditPanel";
import { matchesFilters, NO_FILTERS, SegmentsFilterBar } from "~/components/SegmentsFilters";
import { SegmentsTable } from "~/components/SegmentsTable";
import { StepHeader } from "~/components/StepHeader";
import { TrashPanel } from "~/components/TrashPanel";
import { validateAssessmentSearch } from "~/lib/assessment-search";
import type { Classification, SegmentType } from "~/lib/osm/types";
import {
  assessmentQueryKey,
  deleteSegments,
  downloadCity,
  mergeSegments,
  restoreSegments,
  type SegmentItem,
  unmergeSegments,
  workspaceQueryOptions,
} from "~/queries/assessment";

export const Route = createFileRoute("/avaliacao/refinar-dados")({
  validateSearch: validateAssessmentSearch,
  loaderDeps: ({ search }) => ({ cidade: search.cidade }),
  loader: ({ context: { queryClient }, deps }) => (deps.cidade ? queryClient.ensureQueryData(workspaceQueryOptions(deps.cidade)) : undefined),
  component: RefinarDados,
});

function NoCity({ text }: { text: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded bg-white p-8 text-center shadow-2xl">
      <h3 className="mb-2 text-xl font-semibold">Selecione uma cidade na página de avaliação</h3>
      <p className="mb-6 text-sm text-gray-600">{text}</p>
      <Button asChild className="bg-ideciclo-blue hover:bg-blue-600">
        <Link to="/avaliacao" search={{ cidade: undefined, trecho: undefined }}>
          Voltar para Avaliação
        </Link>
      </Button>
    </div>
  );
}

function RefinarDados() {
  const { cidade } = Route.useSearch();
  return (
    <>
      <StepHeader title="Aprimorar Dados" crumb="Aprimorar Dados" />
      <div className="container mx-auto px-4 pb-12">
        {cidade ? (
          <Workspace cityId={cidade} />
        ) : (
          <NoCity text="Esta etapa é dedicada ao aprimoramento. Volte para Avaliação, escolha a cidade e então retorne para revisar os trechos." />
        )}
      </div>
    </>
  );
}

function Workspace({ cityId }: { cityId: string }) {
  const { data: workspace } = useSuspenseQuery(workspaceQueryOptions(cityId));
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(NO_FILTERS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [mergeOpen, setMergeOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Every change reloads the workspace; the selection refers to what was on screen, so it goes.
  const afterChange = async (message?: string) => {
    setSelected(new Set());
    setNotice(message ?? null);
    await queryClient.invalidateQueries({ queryKey: assessmentQueryKey });
  };

  const remove = useMutation({
    mutationFn: (ids: string[]) => deleteSegments({ data: { ids } }),
    onSuccess: () => afterChange("Segmentos movidos para a lixeira. Você pode restaurá-los na seção de lixeira."),
  });
  const restore = useMutation({
    mutationFn: (ids: string[]) => restoreSegments({ data: { ids } }),
    onSuccess: () => afterChange("Segmentos restaurados."),
  });
  const merge = useMutation({
    mutationFn: (input: { ids: string[]; name: string; type: SegmentType; classification: Classification | null }) => mergeSegments({ data: input }),
    onSuccess: async () => {
      setMergeOpen(false);
      await afterChange("Segmentos mesclados.");
    },
  });
  const unmerge = useMutation({
    mutationFn: (input: { parentId: string; childIds: string[] }) => unmergeSegments({ data: input }),
    onSuccess: () => afterChange("Segmentos desmesclados."),
  });
  const reset = useMutation({
    mutationFn: () => {
      if (!workspace.city) throw new Error("Cidade não encontrada.");
      return downloadCity({ data: { cityId, cityName: workspace.city.name, stateName: workspace.city.state, replace: true } });
    },
    onSuccess: async () => {
      setConfirmReset(false);
      await afterChange("Dados recarregados do OpenStreetMap.");
    },
  });

  const topLevel = useMemo(() => workspace.segments.filter((s) => s.parentId === null), [workspace.segments]);
  const parts = useMemo(() => {
    const byParent = new Map<string, SegmentItem[]>();
    for (const s of workspace.segments) if (s.parentId) byParent.set(s.parentId, [...(byParent.get(s.parentId) ?? []), s]);
    return byParent;
  }, [workspace.segments]);
  const filtered = useMemo(() => topLevel.filter((s) => matchesFilters(s, filters)), [topLevel, filters]);
  const selectedItems = topLevel.filter((s) => selected.has(s.id));

  const toggle = useCallback((id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const toggleMany = useCallback((ids: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);
  const removeOne = useCallback((id: string) => remove.mutate([id]), [remove]);
  const unmergeParts = useCallback((parentId: string, childIds: string[]) => unmerge.mutate({ parentId, childIds }), [unmerge]);

  const { city } = workspace;
  if (!city) return <NoCity text="Esta cidade ainda não foi baixada. Escolha-a em Avaliação para baixar os dados do OpenStreetMap." />;

  const busy = remove.isPending || restore.isPending || merge.isPending || unmerge.isPending || reset.isPending;
  const error = remove.error ?? restore.error ?? unmerge.error ?? reset.error;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-3xl text-lg text-gray-600">
          Revise os dados da cidade selecionada, ajuste nomes e tipologias e confirme os trechos antes de seguir para a avaliação em campo.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/avaliacao" search={{ cidade: undefined, trecho: undefined }}>
              Trocar Cidade
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/avaliacao" search={{ cidade: cityId, trecho: undefined }}>
              <ArrowLeft className="mr-2 size-4" />
              Voltar às Etapas
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <div>
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </div>
        </Alert>
      )}
      {notice && !error && <p className="text-sm text-muted-foreground">{notice}</p>}

      <CityInfrastructureCard city={city} />

      <AutoMergePanel segments={workspace.segments} />

      <div className="space-y-4">
        <SegmentsFilterBar filters={filters} onChange={setFilters} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedItems.length === 0 ? `${filtered.length.toLocaleString("pt-BR")} de ${topLevel.length.toLocaleString("pt-BR")} segmentos` : `${selectedItems.length} selecionado${selectedItems.length === 1 ? "" : "s"}`}
          </span>
          {selectedItems.length >= 2 && (
            <Button size="sm" onClick={() => setMergeOpen(true)} disabled={busy}>
              Mesclar selecionados
            </Button>
          )}
          {selectedItems.length >= 1 && (
            <>
              <Button size="sm" variant="outline" onClick={() => remove.mutate(selectedItems.map((s) => s.id))} disabled={busy}>
                Mover para a lixeira
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Limpar seleção
              </Button>
            </>
          )}
        </div>

        {topLevel.length === 0 ? (
          <div className="py-8 text-center">
            <p>Nenhum segmento encontrado para esta cidade.</p>
          </div>
        ) : (
          <SegmentsTable
            segments={filtered}
            parts={parts}
            selected={selected}
            onToggle={toggle}
            onToggleMany={toggleMany}
            onDelete={removeOne}
            onUnmerge={unmergeParts}
            busy={busy}
          />
        )}
      </div>

      {selectedItems.length === 1 && selectedItems[0] && (
        <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando trecho…</p>}>
          <SegmentEditPanel key={selectedItems[0].id} segment={selectedItems[0]} />
        </Suspense>
      )}

      {mergeOpen && (
        <MergeSegmentsDialog
          segments={selectedItems}
          pending={merge.isPending}
          error={merge.error?.message ?? null}
          onConfirm={(name, type, classification) => merge.mutate({ ids: selectedItems.map((s) => s.id), name, type, classification })}
          onClose={() => setMergeOpen(false)}
        />
      )}

      <TrashPanel deleted={workspace.deleted} busy={busy} onRestore={(ids) => restore.mutate(ids)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
            <span>Isto descarta os ajustes e baixa tudo de novo do OpenStreetMap. Continuar?</span>
            <Button size="sm" variant="destructive" onClick={() => reset.mutate()} disabled={busy}>
              {reset.isPending ? "Recarregando…" : "Sim, resetar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmReset(false)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmReset(true)} className="flex items-center gap-2">
            <RefreshCw className="size-4" />
            Resetar dados
          </Button>
        )}
        <Button asChild className="bg-ideciclo-blue hover:bg-blue-600">
          <Link to="/avaliacao/escolher-estrutura" search={{ cidade: cityId, trecho: undefined }}>
            Continuar para Próxima Etapa
          </Link>
        </Button>
      </div>
    </div>
  );
}
