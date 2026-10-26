import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { SegmentPreviewMap } from "~/components/SegmentPreviewMap";
import type { Prefill, Technical } from "~/lib/osm/technical";
import { CLASSIFICATION_LABEL, CLASSIFICATIONS, type Classification, isClassification, isSegmentType, SEGMENT_TYPES, type SegmentType } from "~/lib/osm/types";
import { SEGMENT_TYPE_COLOR, formatKm } from "~/lib/segment-styles";
import {
  assessmentQueryKey,
  fetchOsmComplement,
  type SegmentItem,
  saveTechnical,
  segmentDetailQueryOptions,
  updateSegment,
} from "~/queries/assessment";

const NO_CLASSIFICATION = "none";

// The form is free text on purpose: the values read from the OpenStreetMap and the
// ones people type are both sentences ("lado esquerdo da via"), and these are only hints.
const SENTIDOS = ["unidirecional", "bidirecional", "contrafluxo provável"];
const POSICOES = [
  "lado esquerdo da via",
  "lado direito da via",
  "lados esquerdo e direito",
  "ambos os lados da via",
  "infraestrutura dedicada",
  "infraestrutura segregada",
  "calçada partilhada",
  "calçada partilhada segregada",
];

type Draft = {
  name: string;
  type: SegmentType;
  classification: Classification | null;
  trechoInicio: string;
  trechoFim: string;
  sentido: string;
  posicaoNaVia: string;
  velocidade: string;
  numeroFaixas: string;
  pavimento: string;
  largura: string;
  bufferSeparacao: string;
  blocks: string;
  intersections: string;
};

const text = (value: number | string | null | undefined) => (value === null || value === undefined ? "" : String(value));
const toNumber = (value: string) => (value.trim() === "" || Number.isNaN(Number(value.replace(",", "."))) ? undefined : Number(value.replace(",", ".")));

function initialDraft(segment: SegmentItem, prefill: Prefill | null): Draft {
  return {
    name: segment.name,
    type: segment.type,
    classification: segment.classification,
    trechoInicio: prefill?.trechoInicio ?? "",
    trechoFim: prefill?.trechoFim ?? "",
    sentido: prefill?.sentido ?? "",
    posicaoNaVia: prefill?.posicaoNaVia ?? "",
    velocidade: prefill?.velocidade ?? "",
    numeroFaixas: text(prefill?.numeroFaixas),
    pavimento: prefill?.pavimento ?? "",
    largura: text(prefill?.largura),
    bufferSeparacao: prefill?.bufferSeparacao ?? "",
    blocks: text(segment.blocks),
    intersections: text(segment.intersections),
  };
}

type TextKey = Exclude<keyof Draft, "type" | "classification">;

const FIELDS: { key: TextKey; label: string; list?: string[]; placeholder?: string }[] = [
  { key: "trechoInicio", label: "Trecho início", placeholder: "Rua ou cruzamento de onde começa" },
  { key: "trechoFim", label: "Trecho fim", placeholder: "Rua ou cruzamento onde termina" },
  { key: "sentido", label: "Sentido", list: SENTIDOS },
  { key: "posicaoNaVia", label: "Posição na via", list: POSICOES },
  { key: "velocidade", label: "Velocidade regulamentada (km/h)" },
  { key: "numeroFaixas", label: "Número de faixas" },
  { key: "pavimento", label: "Pavimento" },
  { key: "largura", label: "Largura (m)" },
  { key: "bufferSeparacao", label: "Buffer / separação" },
  { key: "blocks", label: "Quadras" },
  { key: "intersections", label: "Interseções" },
];

// Edits one segment: its name, typology and hierarchy, and the technical
// complement the IDECICLO form is prefilled with. The map shows its lines.
// Mount it with the segment's id as key, so each segment starts from its own data.
export function SegmentEditPanel({ segment }: { segment: SegmentItem }) {
  const { data: detail } = useSuspenseQuery(segmentDetailQueryOptions(segment.id));
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => initialDraft(segment, detail?.technical?.ideciclo_prefill ?? segment.prefill));
  const [osm, setOsm] = useState<Technical | undefined>();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const complement = useMutation({
    mutationFn: () => fetchOsmComplement({ data: { segmentId: segment.id } }),
    onSuccess: (result) => {
      // What is already filled in stays; the OpenStreetMap only fills the blanks.
      const fill = (current: string, value: string | number | undefined) => (current.trim() === "" ? text(value) : current);
      setDraft((current) => ({
        ...current,
        sentido: fill(current.sentido, result.prefill.sentido),
        posicaoNaVia: fill(current.posicaoNaVia, result.prefill.posicaoNaVia),
        velocidade: fill(current.velocidade, result.prefill.velocidade),
        numeroFaixas: fill(current.numeroFaixas, result.prefill.numeroFaixas),
        pavimento: fill(current.pavimento, result.prefill.pavimento),
        largura: fill(current.largura, result.prefill.largura),
        bufferSeparacao: fill(current.bufferSeparacao, result.prefill.bufferSeparacao),
        blocks: fill(current.blocks, result.blocks),
        intersections: fill(current.intersections, result.intersections),
      }));
      setOsm(result.osm);
      setMessage({ ok: true, text: `Dados lidos de ${result.found} de ${result.asked} trechos do OpenStreetMap. Revise e salve.` });
    },
    onError: (error) => setMessage({ ok: false, text: error.message }),
  });

  const save = useMutation({
    mutationFn: async () => {
      const pending = FIELDS.filter((f) => draft[f.key] === "").map((f) => `${f.label} sem preenchimento`);
      const prefill: Prefill = {
        tipologia: draft.type,
        hierarquia: draft.classification ?? undefined,
        trechoInicio: draft.trechoInicio.trim() || undefined,
        trechoFim: draft.trechoFim.trim() || undefined,
        sentido: draft.sentido.trim() || undefined,
        posicaoNaVia: draft.posicaoNaVia.trim() || undefined,
        velocidade: draft.velocidade.trim() || undefined,
        numeroFaixas: toNumber(draft.numeroFaixas),
        pavimento: draft.pavimento.trim() || undefined,
        largura: toNumber(draft.largura),
        bufferSeparacao: draft.bufferSeparacao.trim() || undefined,
        pendenciasCampo: pending,
      };
      await updateSegment({ data: { id: segment.id, name: draft.name, type: draft.type, classification: draft.classification } });
      await saveTechnical({
        data: { id: segment.id, prefill, blocks: toNumber(draft.blocks) ?? null, intersections: toNumber(draft.intersections) ?? null, osm },
      });
    },
    onSuccess: async () => {
      setMessage({ ok: true, text: "Salvo." });
      await queryClient.invalidateQueries({ queryKey: assessmentQueryKey });
    },
    onError: (error) => setMessage({ ok: false, text: error.message }),
  });

  if (!detail) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Editar trecho e conteúdo técnico</CardTitle>
        <CardDescription>
          Ajuste nome, tipologia, hierarquia e o complemento técnico que preenche o formulário. {formatKm(segment.km)} km ·{" "}
          {detail.parts.length > 1 ? `${detail.parts.length} segmentos mesclados` : "1 segmento do OpenStreetMap"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-3">
          <SegmentPreviewMap geometry={detail.geometry} color={SEGMENT_TYPE_COLOR[draft.type]} className="h-80 w-full rounded-md border" />
          <ul className="max-h-40 space-y-1 overflow-auto text-sm">
            {detail.parts.map((part) => (
              <li key={part.id} className="flex items-center justify-between gap-2 rounded border px-2 py-1">
                <span className="truncate">{part.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {part.osmId ? `way/${part.osmId} · ` : ""}
                  {formatKm(part.km)} km
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Tipologia</Label>
              <Select value={draft.type} onValueChange={(value) => isSegmentType(value) && set({ type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Hierarquia da via</Label>
              <Select value={draft.classification ?? NO_CLASSIFICATION} onValueChange={(value) => set({ classification: isClassification(value) ? value : null })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLASSIFICATION}>Não classificada</SelectItem>
                  {CLASSIFICATIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CLASSIFICATION_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`edit-${field.key}`}>{field.label}</Label>
                <Input
                  id={`edit-${field.key}`}
                  list={field.list ? `list-${field.key}` : undefined}
                  placeholder={field.placeholder}
                  value={draft[field.key]}
                  onChange={(e) => set({ [field.key]: e.target.value })}
                />
                {field.list && (
                  <datalist id={`list-${field.key}`}>
                    {field.list.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => complement.mutate()} disabled={complement.isPending}>
              {complement.isPending ? "Baixando…" : "Preencher com dados do OpenStreetMap"}
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !draft.name.trim()}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
            {message && <span className={`text-sm ${message.ok ? "text-muted-foreground" : "text-destructive"}`}>{message.text}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
