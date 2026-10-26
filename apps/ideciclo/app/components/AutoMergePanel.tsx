import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { normalizeStreetName } from "@ameciclo/db/cycling-streets";
import { Button } from "@ameciclo/ui/components/button";
import { Checkbox } from "@ameciclo/ui/components/checkbox";
import { CLASSIFICATION_LABEL, type Classification, type SegmentType } from "~/lib/osm/types";
import { formatKm } from "~/lib/segment-styles";
import { assessmentQueryKey, mergeSegments, type SegmentItem } from "~/queries/assessment";

type Suggestion = {
  key: string;
  name: string;
  type: SegmentType;
  classification: Classification | null;
  segmentIds: string[];
  selectedIds: string[];
  enabled: boolean;
};

// Loose segments with the same street name (ignoring case, accents and
// abbreviations), the same typology and the same hierarchy are probably one
// stretch of street cut into pieces by the OpenStreetMap.
function suggest(segments: SegmentItem[]): Suggestion[] {
  const groups = new Map<string, SegmentItem[]>();
  for (const segment of segments.filter((s) => s.parentId === null && !s.isMerged)) {
    const key = `${normalizeStreetName(segment.name)}|${segment.type}|${segment.classification ?? ""}`;
    groups.set(key, [...(groups.get(key) ?? []), segment]);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) => {
      const [first] = items;
      return {
        key,
        name: [...new Set(items.map((s) => s.name))].join(" / "),
        type: first?.type ?? "Ciclofaixa",
        classification: first?.classification ?? null,
        segmentIds: items.map((s) => s.id),
        selectedIds: items.map((s) => s.id),
        enabled: true,
      };
    })
    .sort((a, b) => b.segmentIds.length - a.segmentIds.length);
}

export function AutoMergePanel({ segments }: { segments: SegmentItem[] }) {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  const apply = useMutation({
    mutationFn: async (approved: Suggestion[]) => {
      for (const s of approved) {
        await mergeSegments({ data: { ids: s.selectedIds, name: s.name, type: s.type, classification: s.classification } });
      }
    },
    onSuccess: async () => {
      setSuggestions(null);
      await queryClient.invalidateQueries({ queryKey: assessmentQueryKey });
    },
  });

  const patch = (key: string, change: (s: Suggestion) => Suggestion) =>
    setSuggestions((current) => current?.map((s) => (s.key === key ? change(s) : s)) ?? null);

  const approved = suggestions?.filter((s) => s.enabled && s.selectedIds.length >= 2) ?? [];
  const byId = new Map(segments.map((s) => [s.id, s]));

  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Mesclagem automática sugerida</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSuggestions(suggest(segments))}>
            Gerar sugestões
          </Button>
          {suggestions && suggestions.length > 0 && (
            <Button size="sm" disabled={apply.isPending || approved.length === 0} onClick={() => apply.mutate(approved)}>
              {apply.isPending ? "Aplicando…" : `Aplicar ${approved.length} ${approved.length === 1 ? "sugestão" : "sugestões"}`}
            </Button>
          )}
        </div>
      </div>

      {apply.error && <p className="mb-2 text-sm text-destructive">{apply.error.message}</p>}

      {suggestions === null ? (
        <p className="text-sm text-muted-foreground">Gere sugestões para revisar agrupamentos por nome, tipologia e hierarquia.</p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum grupo com nome, tipologia e hierarquia compatíveis foi encontrado.</p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-auto">
          {suggestions.map((s) => (
            <div key={s.key} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  <Checkbox checked={s.enabled} onCheckedChange={(checked) => patch(s.key, (x) => ({ ...x, enabled: checked === true }))} />
                  <span className="text-sm font-semibold">{s.name}</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  {s.type} · {s.classification ? CLASSIFICATION_LABEL[s.classification] : "não classificada"}
                </span>
              </div>
              <div className="space-y-1">
                {s.segmentIds.map((id) => {
                  const segment = byId.get(id);
                  return (
                    <label key={id} className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-muted/40">
                      <span className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={s.selectedIds.includes(id)}
                          onCheckedChange={(checked) =>
                            patch(s.key, (x) => ({ ...x, selectedIds: checked === true ? [...x.selectedIds, id] : x.selectedIds.filter((i) => i !== id) }))
                          }
                        />
                        {segment?.name ?? id}
                      </span>
                      <span className="text-xs text-muted-foreground">{segment ? formatKm(segment.km) : ""} km</span>
                    </label>
                  );
                })}
              </div>
              {s.selectedIds.length < 2 && <p className="mt-2 text-xs text-destructive">Esta sugestão precisa de pelo menos 2 trechos para ser aplicada.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
