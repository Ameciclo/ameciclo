import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ContagemDocument,
  diffDocuments,
  hourText,
  validateDocument,
} from "@ameciclo/db/document";
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
import { NativeSelect } from "@ameciclo/ui/components/native-select";
import { Textarea } from "@ameciclo/ui/components/textarea";
import { ChangeList } from "~/components/ChangeList";
import { DataTable, type TableColumn } from "~/components/DataTable";
import { formatNumber } from "~/lib/format";
import { contagemQueryKeys, saveContagem } from "~/queries/contagens";

type Props = {
  contagemId: number;
  original: ContagemDocument;
  version: number;
  dictionary: { key: string; label: string }[];
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
          <NativeSelect
            value={row.original.characteristicKey ?? ""}
            aria-label={`Característica de ${row.original.label}`}
            onChange={(e) => setObservationKey(row.original.index, e.target.value || null)}
            className="h-8 min-w-44"
          >
            <option value="">— sem mapa —</option>
            {dictionary.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </NativeSelect>
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
        setError(
          result.code === "conflict"
            ? `Esta contagem foi alterada por ${result.lastAuthor ?? "outra pessoa"} desde que você começou a editar. Recarregue a página.`
            : result.problems.join(" "),
        );
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
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 text-sm">
            <label htmlFor="edit-date" className="text-muted-foreground">
              Data
            </label>
            <Input id="edit-date" type="date" value={draft.header.date} onChange={(e) => setHeader("date", e.target.value)} />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="edit-variant" className="text-muted-foreground">
              Variante
            </label>
            <Input
              id="edit-variant"
              value={draft.header.variant ?? ""}
              placeholder="ex.: Pista Leste"
              onChange={(e) => setHeader("variant", e.target.value || null)}
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="edit-report" className="text-muted-foreground">
              Link do relatório
            </label>
            <Input
              id="edit-report"
              value={draft.header.reportUrl ?? ""}
              onChange={(e) => setHeader("reportUrl", e.target.value || null)}
            />
          </div>
          {draft.approaches.map((name, i) => (
            <div key={i} className="space-y-1 text-sm">
              <label htmlFor={`edit-approach-${i}`} className="text-muted-foreground">
                Aproximação {i + 1}
              </label>
              <Input id={`edit-approach-${i}`} value={name} onChange={(e) => setApproach(i, e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Movimentos por hora</CardTitle>
          {original.header.isProjected && (
            <div className="flex gap-2">
              <Button size="sm" variant={basis === "projected" ? "default" : "outline"} onClick={() => setBasis("projected")}>
                Estimado
              </Button>
              <Button size="sm" variant={basis === "observed" ? "default" : "outline"} onClick={() => setBasis("observed")}>
                Observado
              </Button>
            </div>
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
        <CardContent className="overflow-x-auto">
          <DataTable columns={observationColumns} data={observationRows} pageSize={100} />
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
