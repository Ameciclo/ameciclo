import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isPosition, POSITION_LABEL, POSITIONS } from "@ameciclo/db/shared";
import {
  addObservationRow,
  effectivePositions,
  setPosition,
  type ContagemDocument,
  diffDocuments,
  hourText,
  reshapeTopology,
  validateDocument,
} from "@ameciclo/db/document";
import { Trash2 } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ameciclo/ui/components/dialog";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@ameciclo/ui/components/toggle-group";
import { Textarea } from "@ameciclo/ui/components/textarea";
import { ChangeList } from "~/components/ChangeList";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { DatePicker } from "~/components/DatePicker";
import { MovementDiagram } from "@ameciclo/ui/components/movement-diagram";
import { formatNumber, TOPOLOGY_LABEL } from "~/lib/format";
import { failureMessage } from "~/lib/save-errors";
import { contagemQueryKeys, saveContagem } from "~/queries/contagens";

type Props = {
  contagemId: number;
  original: ContagemDocument;
  version: number;
  dictionary: { key: string; label: string; isRollup: boolean }[];
  onCancel: () => void;
  onSaved: () => void;
};

type GridRow = {
  id: string;
  index: number;
  label: string;
  rawLabel?: string;
  characteristicKey?: string | null;
  cells: number[];
  total: number | null;
};

const NO_MAP = "__none__";

function isTopology(v: string): v is ContagemDocument["header"]["topology"] {
  return v === "point" || v === "t_junction" || v === "crossroad";
}

function NumberCell({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
      className="h-8 w-14 rounded border border-input bg-background px-1 text-right text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
    />
  );
}

function hourColumns(
  hours: string[],
  cell: (row: GridRow, bucket: number) => React.ReactNode,
): TableColumn<GridRow>[] {
  return hours.map((hour, i) => ({
    id: `h${i}`,
    header: hour,
    enableSorting: false,
    cell: ({ row }) => cell(row.original, i),
    meta: { headClassName: "text-right", cellClassName: "px-1 text-right" },
  }));
}

export function EditPanel({ contagemId, original, version, dictionary, onCancel, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ContagemDocument>(original);
  const [basis, setBasis] = useState<"observed" | "projected">(original.header.isProjected ? "projected" : "observed");
  const [reviewing, setReviewing] = useState(false);
  const [toAdd, setToAdd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bucketCount = Math.max(0, ...original.movements.map((m) => m.cells.length));
  const hours = useMemo(
    () => Array.from({ length: bucketCount }, (_, i) => hourText(original.header, i)),
    [original.header, bucketCount],
  );

  const changes = useMemo(() => diffDocuments(original, draft), [original, draft]);
  const problems = useMemo(() => validateDocument(draft), [draft]);

  const setHeader = <K extends keyof ContagemDocument["header"]>(key: K, value: ContagemDocument["header"][K]) =>
    setDraft((d) => ({ ...d, header: { ...d.header, [key]: value } }));
  const setApproach = (i: number, value: string) =>
    setDraft((d) => ({ ...d, approaches: d.approaches.map((a, j) => (j === i ? value : a)) }));
  const setMovementCell = (index: number, bucket: number, value: number) =>
    setDraft((d) => ({
      ...d,
      movements: d.movements.map((m, i) =>
        i === index ? { ...m, cells: m.cells.map((c, j) => (j === bucket ? value : c)) } : m,
      ),
    }));
  const setObservationCell = (index: number, bucket: number, value: number) =>
    setDraft((d) => ({
      ...d,
      observations: d.observations.map((o, i) =>
        i === index ? { ...o, cells: o.cells.map((c, j) => (j === bucket ? value : c)) } : o,
      ),
    }));
  const setObservationTotal = (index: number, value: number) =>
    setDraft((d) => ({
      ...d,
      observations: d.observations.map((o, i) => (i === index ? { ...o, total: value } : o)),
    }));
  const setObservationKey = (index: number, key: string | null) =>
    setDraft((d) => ({
      ...d,
      observations: d.observations.map((o, i) => (i === index ? { ...o, characteristicKey: key } : o)),
    }));

  const removeObservation = (index: number) =>
    setDraft((d) => ({ ...d, observations: d.observations.filter((_, i) => i !== index) }));
  const rainBuckets = draft.conditions.filter((c) => c.kind === "rain").map((c) => c.bucket);
  const setRain = (buckets: number[]) =>
    setDraft((d) => ({
      ...d,
      conditions: [
        ...d.conditions.filter((c) => c.kind !== "rain" || buckets.includes(c.bucket)),
        ...buckets
          .filter((b) => !d.conditions.some((c) => c.kind === "rain" && c.bucket === b))
          .map((bucket) => ({ bucket, kind: "rain", value: null, note: null })),
      ],
    }));
  const setNote = (index: number, text: string) =>
    setDraft((d) => ({ ...d, notes: d.notes.map((n, i) => (i === index ? { ...n, text } : n)) }));
  const addNote = () =>
    setDraft((d) => ({ ...d, notes: [...d.notes, { bucketFrom: null, bucketTo: null, text: "" }] }));
  const removeNote = (index: number) => setDraft((d) => ({ ...d, notes: d.notes.filter((_, i) => i !== index) }));

  // A characteristic already in the list is hidden, except "outros", which can repeat.
  const addable = useMemo(() => {
    const present = new Set(draft.observations.map((o) => o.characteristicKey));
    return dictionary.filter((d) => !d.isRollup && (d.key === "outros" || !present.has(d.key)));
  }, [dictionary, draft.observations]);

  const positions = effectivePositions(draft);

  const flows = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const m of draft.movements) {
      if (m.basis !== basis) continue;
      sums[`${m.from}-${m.to}`] = m.cells.reduce((s, v) => s + v, 0) + (m.total ?? 0);
    }
    return sums;
  }, [draft.movements, basis]);

  const movementRows = useMemo<GridRow[]>(
    () =>
      draft.movements.flatMap((m, index) =>
        m.basis !== basis
          ? []
          : [
              {
                id: String(index),
                index,
                label: `${draft.approaches[m.from]} → ${draft.approaches[m.to]}`,
                cells: m.cells,
                total: m.total,
              },
            ],
      ),
    [draft.movements, draft.approaches, basis],
  );
  const observationRows = useMemo<GridRow[]>(
    () =>
      draft.observations.flatMap((o, index) =>
        o.basis !== "observed"
          ? []
          : [
              {
                id: String(index),
                index,
                label: o.rawLabel,
                rawLabel: o.rawLabel,
                characteristicKey: o.characteristicKey,
                cells: o.cells,
                total: o.total,
              },
            ],
      ),
    [draft.observations],
  );

  const movementColumns = useMemo<TableColumn<GridRow>[]>(
    () => [
      {
        id: "label",
        header: "Movimento",
        enableSorting: false,
        cell: ({ row }) => <span className="font-medium">{row.original.label}</span>,
        meta: { cellClassName: "min-w-48" },
      },
      ...hourColumns(hours, (row, bucket) => (
        <NumberCell
          value={row.cells[bucket] ?? 0}
          label={`${row.label} ${hours[bucket]}`}
          onChange={(v) => setMovementCell(row.index, bucket, v)}
        />
      )),
      {
        id: "total",
        header: "Total",
        enableSorting: false,
        cell: ({ row }) => <span className="font-semibold">{formatNumber(row.original.cells.reduce((s, v) => s + v, 0))}</span>,
        meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
      },
    ],
    [hours],
  );

  const observationColumns = useMemo<TableColumn<GridRow>[]>(
    () => [
      {
        id: "label",
        header: "Linha da planilha",
        enableSorting: false,
        cell: ({ row }) => <span className="font-medium">{row.original.label}</span>,
        meta: { cellClassName: "min-w-40" },
      },
      {
        id: "key",
        header: "Característica",
        enableSorting: false,
        cell: ({ row }) => (
          <Select
            value={row.original.characteristicKey ?? NO_MAP}
            onValueChange={(v) => setObservationKey(row.original.index, v === NO_MAP ? null : v)}
          >
            <SelectTrigger className="h-8 min-w-44" aria-label={`Característica de ${row.original.label}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MAP}>— sem mapa —</SelectItem>
              {dictionary.map((d) => (
                <SelectItem key={d.key} value={d.key}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      ...hourColumns(hours, (row, bucket) => (
        <NumberCell
          value={row.cells[bucket] ?? 0}
          label={`${row.label} ${hours[bucket]}`}
          onChange={(v) => setObservationCell(row.index, bucket, v)}
        />
      )),
      {
        id: "total",
        header: "Total",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.total !== null && row.original.cells.every((c) => c === 0) ? (
            <NumberCell
              value={row.original.total}
              label={`${row.original.label} total`}
              onChange={(v) => setObservationTotal(row.original.index, v)}
            />
          ) : (
            <span className="font-semibold">{formatNumber(row.original.cells.reduce((s, v) => s + v, 0))}</span>
          ),
        meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
      },
      {
        id: "remove",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remover ${row.original.label}`}
            onClick={() => removeObservation(row.original.index)}
          >
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [hours, dictionary],
  );

  const save = useMutation({
    mutationFn: () =>
      saveContagem({
        data: { id: contagemId, expectedVersion: version, doc: draft, reason: reason.trim() || null },
      }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(failureMessage(result));
        return;
      }
      await Promise.all(contagemQueryKeys(contagemId).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setReviewing(false);
      onSaved();
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da contagem</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <Label htmlFor="edit-date" className="text-muted-foreground">
              Data
            </Label>
            <DatePicker id="edit-date" value={draft.header.date} onChange={(v) => setHeader("date", v)} />
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="edit-variant" className="text-muted-foreground">
              Variante
            </Label>
            <Input
              id="edit-variant"
              value={draft.header.variant ?? ""}
              placeholder="ex.: Pista Leste"
              onChange={(e) => setHeader("variant", e.target.value || null)}
            />
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="edit-report" className="text-muted-foreground">
              Link do relatório
            </Label>
            <Input
              id="edit-report"
              value={draft.header.reportUrl ?? ""}
              onChange={(e) => setHeader("reportUrl", e.target.value || null)}
            />
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="edit-topology" className="text-muted-foreground">
              Tipo
            </Label>
            <Select
              value={draft.header.topology}
              onValueChange={(v) => {
                if (isTopology(v)) setDraft((d) => reshapeTopology(d, v));
              }}
            >
              <SelectTrigger id="edit-topology">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TOPOLOGY_LABEL) as ContagemDocument["header"]["topology"][]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TOPOLOGY_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="edit-status" className="text-muted-foreground">
              Situação
            </Label>
            <Select value={draft.header.status} onValueChange={(v) => setHeader("status", v === "published" ? "published" : "draft")}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {draft.approaches.map((name, i) => (
            <div key={i} className="space-y-1 text-sm">
              <Label htmlFor={`edit-approach-${i}`} className="text-muted-foreground">
                Aproximação {i + 1}
              </Label>
              <div className="flex gap-2">
                <Input id={`edit-approach-${i}`} value={name} onChange={(e) => setApproach(i, e.target.value)} />
                <Select
                  value={positions[i]}
                  onValueChange={(v) => {
                    if (isPosition(v)) setDraft((d) => setPosition(d, i, v));
                  }}
                >
                  <SelectTrigger className="w-28 shrink-0" aria-label={`Posição da aproximação ${i + 1}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {POSITION_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          <div className="space-y-1 text-sm sm:col-span-2">
            <Label htmlFor="edit-notes" className="text-muted-foreground">
              Observações
            </Label>
            <Textarea id="edit-notes" value={draft.header.notes ?? ""} onChange={(e) => setHeader("notes", e.target.value || null)} />
          </div>
          </div>
          {draft.approaches.length <= 4 && (
            <div className="flex items-start justify-center rounded-md border bg-muted/30 p-3">
              <MovementDiagram topology={draft.header.topology} approaches={draft.approaches} positions={positions} flows={flows} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Movimentos por hora</CardTitle>
          {original.header.isProjected && (
            <ToggleGroup
              type="single"
              value={basis}
              onValueChange={(v) => {
                if (v === "projected" || v === "observed") setBasis(v);
              }}
            >
              <ToggleGroupItem value="projected">Estimado</ToggleGroupItem>
              <ToggleGroupItem value="observed">Observado</ToggleGroupItem>
            </ToggleGroup>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable columns={movementColumns} data={movementRows} pageSize={100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <DataTable columns={observationColumns} data={observationRows} pageSize={100} />
          <div className="flex max-w-md items-center gap-2">
            <Select value={toAdd} onValueChange={setToAdd}>
              <SelectTrigger aria-label="Característica a adicionar">
                <SelectValue placeholder="Adicionar característica…" />
              </SelectTrigger>
              <SelectContent>
                {addable.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!toAdd}
              onClick={() => {
                const entry = dictionary.find((d) => d.key === toAdd);
                if (entry) setDraft((d) => addObservationRow(d, entry.key, entry.label));
                setToAdd("");
              }}
            >
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Informe só as linhas de detalhe (por exemplo, Carona criança, mulher e homem); os totais são calculados.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chuva e notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Horários com chuva</p>
            <ToggleGroup
              type="multiple"
              value={rainBuckets.map(String)}
              onValueChange={(values) => setRain(values.map(Number))}
            >
              {hours.map((hour, i) => (
                <ToggleGroupItem key={hour} value={String(i)}>
                  {hour}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Notas</p>
            {draft.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  value={n.text}
                  aria-label={`Nota ${i + 1}`}
                  onChange={(e) => setNote(i, e.target.value)}
                  className="min-h-10"
                />
                <Button size="icon" variant="ghost" aria-label={`Remover nota ${i + 1}`} onClick={() => removeNote(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addNote}>
              Adicionar nota
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-lg border bg-background p-3 shadow-md">
        <span className="text-sm text-muted-foreground">
          {changes.length === 0 ? "Nenhuma alteração ainda." : `${changes.length} alterações não salvas.`}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button disabled={changes.length === 0} onClick={() => setReviewing(true)}>
            Revisar e salvar
          </Button>
        </div>
      </div>

      <Dialog open={reviewing} onOpenChange={setReviewing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar alterações</DialogTitle>
            <DialogDescription>Confira o que vai mudar antes de salvar uma nova versão.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/30 p-3">
            <ChangeList changes={changes} />
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo da alteração (opcional)"
            aria-label="Motivo da alteração"
          />
          {problems.length > 0 && <p className="text-sm text-destructive">{problems.join(" ")}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(false)}>
              Voltar
            </Button>
            <Button disabled={save.isPending || problems.length > 0} onClick={() => save.mutate()}>
              {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
