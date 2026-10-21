import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { AdminTopbar } from "~/components/AdminTopbar";
import { DataTable, type TableColumn, type TableRowOf } from "~/components/DataTable";
import { MovementDiagram } from "~/components/MovementDiagram";
import { formatDate, formatNumber, hourLabel, TOPOLOGY_LABEL } from "~/lib/format";
import { EditPanel } from "~/components/EditPanel";
import { HistoryPanel } from "~/components/HistoryPanel";
import { IssuesPanel } from "~/components/IssuesPanel";
import {
  contagemQueryOptions,
  documentQueryOptions,
  type getContagem,
  revisionsQueryOptions,
} from "~/queries/contagens";

export const Route = createFileRoute("/contagens/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    const id = Number(params.id);
    const data = await queryClient.ensureQueryData(contagemQueryOptions(id));
    if (!data) throw notFound();
    await queryClient.ensureQueryData(revisionsQueryOptions(id));
  },
  validateSearch: (search: Record<string, unknown>): { editar?: boolean } =>
    search.editar === true || search.editar === "true" ? { editar: true } : {},
  component: ContagemPage,
});

type GridRow = {
  id: string;
  label: string;
  mapped?: boolean;
  rawLabels?: string[];
  cells: number[];
  total: number;
  // Sum of the nested rows, when it disagrees with the total written in the spreadsheet.
  partsTotal?: number;
  strong?: boolean;
  subRows?: GridRow[];
};

const GROUP_ORDER = ["perfil", "comportamento", "carona", "cargueira", "servico", "contramao", "programa", "modal", "infraestrutura", "chuva", "outros"];

const cellOrDot = (value: number) =>
  value ? value.toLocaleString("pt-BR") : <span className="text-muted-foreground/40">·</span>;

function gridColumns(
  title: string,
  hours: string[],
  observed: Set<number> | null,
  renderLabel: (data: GridRow, row: TableRowOf<GridRow>) => React.ReactNode,
): TableColumn<GridRow>[] {
  return [
    {
      id: "label",
      header: title,
      enableSorting: false,
      cell: ({ row }) => renderLabel(row.original, row),
      meta: { cellClassName: "min-w-48" },
    },
    ...hours.map(
      (hour, i): TableColumn<GridRow> => ({
        id: `h${i}`,
        header: hour,
        enableSorting: false,
        cell: ({ row }) =>
          observed && !observed.has(i) ? <span className="text-muted-foreground/30">–</span> : cellOrDot(row.original.cells[i] ?? 0),
        meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
      }),
    ),
    {
      id: "total",
      header: "Total",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatNumber(row.original.total)}
        </span>
      ),
      meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
    },
  ];
}

function ContagemPage() {
  const { id } = Route.useParams();
  const { editar } = Route.useSearch();
  const { data } = useSuspenseQuery(contagemQueryOptions(Number(id)));
  if (!data) throw notFound();
  return <ContagemView data={data} startEditing={editar ?? false} />;
}

type ContagemData = NonNullable<Awaited<ReturnType<typeof getContagem>>>;

function ContagemView({ data, startEditing }: { data: ContagemData; startEditing: boolean }) {
  const { row, movements, observations, dictionary } = data;
  const [editing, setEditing] = useState(startEditing);
  const documentQuery = useQuery({ ...documentQueryOptions(row.id), enabled: editing });
  const [basis, setBasis] = useState<"projected" | "observed">(row.isProjected ? "projected" : "observed");
  // null shows the whole day; a number shows a single hour bucket.
  const [bucket, setBucket] = useState<number | null>(null);

  const startHour = Number.parseInt(row.startedAt ?? "6", 10);
  const dictionaryByKey = useMemo(() => new Map(dictionary.map((d) => [d.key, d])), [dictionary]);

  const bucketCount = useMemo(() => {
    const maxBucket = Math.max(
      -1,
      ...movements.map((m) => m.bucket ?? -1),
      ...observations.map((o) => o.bucket ?? -1),
    );
    return maxBucket + 1;
  }, [movements, observations]);
  const hours = useMemo(
    () => Array.from({ length: bucketCount }, (_, i) => hourLabel(startHour, i, row.bucketMinutes)),
    [bucketCount, startHour, row.bucketMinutes],
  );

  const isPartial = !row.isProjected && row.observedBuckets !== null;
  const observedSet = useMemo(
    () => (row.observedBuckets ? new Set(row.observedBuckets) : null),
    [row.observedBuckets],
  );

  const movementRows = useMemo<GridRow[]>(() => {
    const wanted = row.isProjected ? basis : "observed";
    const byPair = new Map<string, number[]>();
    for (const m of movements) {
      if (m.basis !== wanted || m.bucket === null) continue;
      const key = `${m.fromIdx}-${m.toIdx}`;
      const cells = byPair.get(key) ?? Array.from<number>({ length: bucketCount }).fill(0);
      cells[m.bucket] += m.value;
      byPair.set(key, cells);
    }
    const rows = [...byPair.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([key, cells]): GridRow => {
        const [from, to] = key.split("-").map(Number);
        return {
          id: key,
          label: `${row.approaches[from]} → ${row.approaches[to]}`,
          cells,
          total: cells.reduce((s, v) => s + v, 0),
        };
      });
    const totals = Array.from<number>({ length: bucketCount }).fill(0);
    for (const r of rows) r.cells.forEach((v, i) => (totals[i] += v));
    return [
      ...rows,
      { id: "total", label: "Total", cells: totals, total: totals.reduce((s, v) => s + v, 0), strong: true },
    ];
  }, [movements, basis, row.isProjected, row.approaches, bucketCount]);

  const flows = useMemo(() => {
    const wanted = row.isProjected ? basis : "observed";
    const sums: Record<string, number> = {};
    for (const m of movements) {
      if (m.basis !== wanted || (bucket !== null && m.bucket !== bucket)) continue;
      const key = `${m.fromIdx}-${m.toIdx}`;
      sums[key] = (sums[key] ?? 0) + m.value;
    }
    return sums;
  }, [movements, basis, bucket, row.isProjected]);

  const matrixRows = useMemo(
    () =>
      row.approaches.map((from, i) => ({
        from,
        cells: row.approaches.map((_, j) => (i === j ? null : (flows[`${i}-${j}`] ?? 0))),
      })),
    [flows, row.approaches],
  );

  const matrixColumns = useMemo<TableColumn<(typeof matrixRows)[number]>[]>(
    () => [
      { id: "from", header: "De ↓ / Para →", enableSorting: false, cell: ({ row: r }) => <span className="font-medium">{r.original.from}</span> },
      ...row.approaches.map(
        (to, j): TableColumn<(typeof matrixRows)[number]> => ({
          id: `to${j}`,
          header: to,
          enableSorting: false,
          cell: ({ row: r }) => (r.original.cells[j] === null ? "—" : formatNumber(r.original.cells[j])),
          meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" },
        }),
      ),
    ],
    [row.approaches],
  );

  const characteristicTree = useMemo<GridRow[]>(() => {
    type Entry = { key: string | null; labels: string[]; cells: number[]; total: number };
    const entries = new Map<string, Entry>();
    for (const o of observations) {
      const id = o.characteristicKey ?? `raw:${o.block}-${o.position}`;
      const entry = entries.get(id) ?? {
        key: o.characteristicKey,
        labels: [],
        cells: Array.from<number>({ length: bucketCount }).fill(0),
        total: 0,
      };
      if (!entry.labels.includes(o.rawLabel)) entry.labels.push(o.rawLabel);
      entry.total += o.value;
      if (o.bucket !== null) entry.cells[o.bucket] += o.value;
      entries.set(id, entry);
    }

    const toRow = (entry: Entry): GridRow => {
      const def = entry.key ? dictionaryByKey.get(entry.key) : undefined;
      return {
        id: entry.key ?? `raw:${entry.labels[0]}`,
        label: def?.label ?? entry.labels[0],
        mapped: entry.key !== null,
        rawLabels: entry.labels,
        cells: entry.cells,
        total: entry.total,
      };
    };
    const byLabel = (a: GridRow, b: GridRow) => a.label.localeCompare(b.label, "pt-BR");
    const groupRank = (key: string | null) => {
      const rank = GROUP_ORDER.indexOf((key && dictionaryByKey.get(key)?.group) || "");
      return rank < 0 ? GROUP_ORDER.length : rank;
    };

    const ranked: { rank: number; row: GridRow }[] = [];
    for (const def of dictionary.filter((d) => d.isRollup)) {
      const own = entries.get(def.key);
      const children = [...entries.values()].filter(
        (e) => e.key && dictionaryByKey.get(e.key)?.parentKey === def.key,
      );
      if (!own && children.length === 0) continue;
      const subRows = children.map(toRow).sort(byLabel);
      const parent: GridRow = own ? toRow(own) : { id: def.key, label: def.label, mapped: true, cells: [], total: 0 };
      if (subRows.length > 0) {
        const partsTotal = subRows.reduce((sum, c) => sum + c.total, 0);
        parent.subRows = subRows;
        if (own) {
          if (own.total !== partsTotal) parent.partsTotal = partsTotal;
        } else {
          parent.cells = Array.from<number>({ length: bucketCount }).fill(0);
          for (const child of subRows) child.cells.forEach((v, i) => (parent.cells[i] += v));
          parent.total = partsTotal;
        }
      }
      ranked.push({ rank: groupRank(def.key), row: parent });
    }
    for (const entry of entries.values()) {
      const def = entry.key ? dictionaryByKey.get(entry.key) : undefined;
      if (def?.isRollup || def?.parentKey) continue;
      ranked.push({ rank: groupRank(entry.key), row: toRow(entry) });
    }
    return ranked.sort((a, b) => a.rank - b.rank || byLabel(a.row, b.row)).map((r) => r.row);
  }, [observations, dictionary, dictionaryByKey, bucketCount]);

  const renderCharacteristic = (r: GridRow, tableRow: TableRowOf<GridRow>) => (
    <div className="flex items-center gap-1" style={{ paddingLeft: tableRow.depth * 20 }}>
      {tableRow.getCanExpand() ? (
        <button
          type="button"
          onClick={tableRow.getToggleExpandedHandler()}
          aria-label={tableRow.getIsExpanded() ? "Recolher" : "Expandir"}
          className="text-muted-foreground hover:text-foreground"
        >
          {tableRow.getIsExpanded() ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      ) : (
        <span className="w-4" />
      )}
      <span
        className={tableRow.depth === 0 && tableRow.getCanExpand() ? "font-semibold" : "font-medium"}
        title={r.rawLabels && r.rawLabels.join(" / ") !== r.label ? `Na planilha: ${r.rawLabels.join(" / ")}` : undefined}
      >
        {r.label}
      </span>
      {r.partsTotal !== undefined && (
        <span
          role="img"
          aria-label="Total diverge da soma das partes"
          title={`O total da planilha é ${formatNumber(r.total)}, mas as linhas aninhadas somam ${formatNumber(r.partsTotal)}`}
        >
          <AlertTriangle className="size-4 text-orange-500" />
        </span>
      )}
      {!r.mapped && <Badge variant="outline">sem mapa</Badge>}
    </div>
  );

  const movementCols = useMemo(
    () => gridColumns("Movimento", hours, observedSet, (r) => <span className={r.strong ? "font-semibold" : ""}>{r.label}</span>),
    [hours, observedSet],
  );
  const characteristicCols = useMemo(() => gridColumns("Característica", hours, observedSet, renderCharacteristic), [hours, observedSet]);

  const rain = row.conditions.filter((c) => c.kind === "rain").sort((a, b) => a.bucket - b.bucket);
  const observedHours = row.observedBuckets?.map((b) => hours[b]).filter(Boolean) ?? [];
  const endLabel = hourLabel(startHour, bucketCount, row.bucketMinutes);

  return (
    <>
      <AdminTopbar
        title={row.local.name}
        description={`${formatDate(row.date)}${row.variant ? ` · ${row.variant}` : ""}${row.status === "draft" ? " · rascunho" : ""}`}
        actions={
          <>
            {!editing && (
              <Button size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link to="/contagens">
                <ArrowLeft className="size-4" />
                Contagens
              </Link>
            </Button>
          </>
        }
      />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Ciclistas" value={formatNumber(row.totalCyclists)} hint={row.isProjected ? "estimado (projeção)" : undefined} />
          <Summary label="Pico em 1 hora" value={formatNumber(row.peakBucketCount)} />
          <Summary label="Tipo" value={TOPOLOGY_LABEL[row.topology] ?? row.topology} hint={`${row.approaches.length} aproximações`} />
          <Summary label="Janela" value={`${hours[0] ?? "—"}–${endLabel}`} hint={`${row.bucketMinutes} min por intervalo`} />
        </div>

        {row.isProjected && (
          <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
              <p>
                Contagem <strong>estimada</strong>: apenas {observedHours.length > 0 ? observedHours.join(", ") : "alguns horários"} foram observados; o restante do dia foi projetado.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant={basis === "projected" ? "default" : "outline"} onClick={() => setBasis("projected")}>
                  Estimado
                </Button>
                <Button size="sm" variant={basis === "observed" ? "default" : "outline"} onClick={() => setBasis("observed")}>
                  Observado
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isPartial && (
          <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
            <CardContent className="pt-6 text-sm">
              Contagem <strong>parcial</strong>: só há dados em {observedHours.join(", ")}. Os demais horários estão vazios na planilha e
              não foram projetados, então o total ({formatNumber(row.totalCyclists)}) não representa o dia inteiro.
            </CardContent>
          </Card>
        )}

        {editing ? (
          documentQuery.data ? (
            <EditPanel
              key={documentQuery.data.version}
              contagemId={row.id}
              original={documentQuery.data.doc}
              version={documentQuery.data.version}
              dictionary={dictionary.map((d) => ({ key: d.key, label: d.label, isRollup: d.isRollup }))}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Carregando para edição...</p>
          )
        ) : (
          <>
        <Section title="Matriz de movimentos">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant={bucket === null ? "default" : "outline"} onClick={() => setBucket(null)}>
                Dia todo
              </Button>
              {hours.map((hour, i) => (
                <Button key={hour} size="sm" variant={bucket === i ? "default" : "outline"} disabled={observedSet !== null && !observedSet.has(i)} onClick={() => setBucket(i)}>
                  {hour}
                </Button>
              ))}
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-2">
              {row.approaches.length <= 4 ? (
                <div className="flex justify-center rounded-md border bg-muted/30 p-4">
                  <MovementDiagram topology={row.topology} approaches={row.approaches} flows={flows} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta contagem tem {row.approaches.length} aproximações; o diagrama suporta até 4.
                </p>
              )}
              <DataTable columns={matrixColumns} data={matrixRows} pageSize={100} />
            </div>
            <p className="text-xs text-muted-foreground">
              A posição das aproximações no desenho é ilustrativa, não segue a bússola.
            </p>
          </div>
        </Section>

        <Section title="Movimentos por hora">
          <DataTable columns={movementCols} data={movementRows} pageSize={100} />
        </Section>

        {characteristicTree.length > 0 && (
          <Section title="Características">
            <DataTable
              columns={characteristicCols}
              data={characteristicTree}
              getSubRows={(r) => r.subRows}
              pageSize={100}
            />
          </Section>
        )}

          </>
        )}

        {(rain.length > 0 || row.annotations.length > 0) && (
          <Section title="Condições e notas">
            <div className="space-y-3 text-sm">
              {rain.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">Chuva:</span>
                  {rain.map((c) => (
                    <Badge key={c.id} variant="secondary" title={c.note ?? undefined}>
                      {hours[c.bucket] ?? c.bucket}
                    </Badge>
                  ))}
                </div>
              )}
              {row.annotations.map((n) => (
                <p key={n.id} className="text-muted-foreground">
                  {n.text}
                </p>
              ))}
            </div>
          </Section>
        )}

        {row.warnings.length > 0 && (
          <Section title={`Pendências (${row.warnings.filter((w) => w.status === "open").length} abertas de ${row.warnings.length})`}>
            <IssuesPanel contagemId={row.id} issues={row.warnings} />
          </Section>
        )}

        <Section title="Fonte">
          <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Arquivo</dt>
            <dd>{row.source?.fileName ?? "—"}</dd>
            <dt className="text-muted-foreground">Drive</dt>
            <dd className="font-mono text-xs">{row.source?.driveFileId ?? "—"}</dd>
            <dt className="text-muted-foreground">Layout</dt>
            <dd>{row.layout ?? "—"}</dd>
            {row.sourceDate && (
              <>
                <dt className="text-muted-foreground">Data na planilha</dt>
                <dd>
                  {formatDate(row.sourceDate)} <span className="text-muted-foreground">— {row.dateNote}</span>
                </dd>
              </>
            )}
            {row.reportUrl && (
              <>
                <dt className="text-muted-foreground">Relatório</dt>
                <dd className="truncate">
                  <a href={row.reportUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    {row.reportUrl}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </Section>

        <Section title="Histórico">
          <HistoryPanel contagemId={row.id} currentVersion={row.version} />
        </Section>
      </div>
    </>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">{children}</CardContent>
    </Card>
  );
}
