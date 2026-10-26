import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Checkbox } from "@ameciclo/ui/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import { HierarchyBadge, TypeBadge } from "~/components/TypeBadge";
import { formatKm } from "~/lib/segment-styles";
import type { SegmentItem } from "~/queries/assessment";

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
});

type Column = ColumnDef<typeof features, SegmentItem>;

const PAGE_SIZE = 25;

type Props = {
  segments: SegmentItem[];
  // The parts of each merged segment, by the parent's id.
  parts: Map<string, SegmentItem[]>;
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
  onToggleMany: (ids: string[], checked: boolean) => void;
  onDelete: (id: string) => void;
  onUnmerge: (parentId: string, childIds: string[]) => void;
  busy: boolean;
};

// The parts of a merged segment, each with a checkbox to take it out again.
function MergedParts({ parent, parts, busy, onUnmerge }: { parent: SegmentItem; parts: SegmentItem[]; busy: boolean; onUnmerge: Props["onUnmerge"] }) {
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-ideciclo underline-offset-2 hover:underline">{parts.length} segmentos</summary>
      <ul className="mt-2 space-y-1">
        {parts.map((part) => (
          <li key={part.id} className="flex items-center gap-2">
            <Checkbox
              checked={chosen.includes(part.id)}
              onCheckedChange={(checked) => setChosen(checked === true ? [...chosen, part.id] : chosen.filter((id) => id !== part.id))}
              aria-label={`Desmesclar ${part.name}`}
            />
            <span className="min-w-0 flex-1 truncate" title={part.name}>
              {part.name}
            </span>
            <span className="text-xs text-muted-foreground">{formatKm(part.km)} km</span>
          </li>
        ))}
      </ul>
      <Button
        size="sm"
        variant="outline"
        className="mt-2"
        disabled={busy || chosen.length === 0}
        onClick={() => {
          onUnmerge(parent.id, chosen);
          setChosen([]);
        }}
      >
        Desmesclar selecionados
      </Button>
    </details>
  );
}

export function SegmentsTable({ segments, parts, selected, onToggle, onToggleMany, onDelete, onUnmerge, busy }: Props) {
  const columns = useMemo<Column[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <Checkbox
            checked={selected.has(row.original.id)}
            onCheckedChange={(checked) => onToggle(row.original.id, checked === true)}
            aria-label={`Selecionar ${row.original.name}`}
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.isMerged ? "Trecho mesclado" : row.original.osmId ? `way/${row.original.osmId}` : row.original.id}
            </p>
          </div>
        ),
      },
      { accessorKey: "type", header: "Tipologia", cell: ({ row }) => <TypeBadge type={row.original.type} /> },
      {
        id: "classification",
        header: "Hierarquia",
        accessorFn: (s) => s.classification ?? "",
        cell: ({ row }) => <HierarchyBadge classification={row.original.classification} />,
      },
      { accessorKey: "km", header: "km", cell: ({ row }) => formatKm(row.original.km), meta: { headClassName: "text-right", cellClassName: "text-right tabular-nums" } },
      {
        id: "composition",
        header: "Composição",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isMerged ? (
            <MergedParts parent={row.original} parts={parts.get(row.original.id) ?? []} busy={busy} onUnmerge={onUnmerge} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "evaluated",
        header: "Avaliação",
        cell: ({ row }) => (
          <Badge variant={row.original.evaluated ? "default" : "outline"}>{row.original.evaluated ? "Avaliado" : "Pendente"}</Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" disabled={busy} onClick={() => onDelete(row.original.id)} aria-label={`Mover ${row.original.name} para a lixeira`}>
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [selected, parts, busy, onToggle, onUnmerge, onDelete],
  );

  const table = useTable({
    features,
    columns,
    data: segments,
    initialState: { sorting: [{ id: "name", desc: false }], pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
  });
  const rows = table.getRowModel().rows;
  const pageIds = rows.map((row) => row.original.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.headClassName}>
                      {header.column.id === "select" ? (
                        <Checkbox checked={allOnPage} onCheckedChange={(checked) => onToggleMany(pageIds, checked === true)} aria-label="Selecionar a página" />
                      ) : header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? <ArrowUp className="size-3" /> : sorted === "desc" ? <ArrowDown className="size-3" /> : <ChevronsUpDown className="size-3 opacity-40" />}
                        </button>
                      ) : (
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <table.FlexRender header={header} />
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum segmento corresponde aos filtros.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-state={selected.has(row.original.id) ? "selected" : undefined} className={selected.has(row.original.id) ? "bg-ideciclo-yellow/15" : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {segments.length.toLocaleString("pt-BR")} segmentos · página {table.state.pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
