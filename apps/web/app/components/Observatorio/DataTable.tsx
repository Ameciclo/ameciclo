// A tabela das páginas de observatório: shadcn Table + TanStack Table v9, com ordenação por qualquer coluna (clique de novo
// para inverter), busca opcional pelo texto da linha e, se pedido, só as primeiras linhas com "mostrar todas".
// Alinhamento e visibilidade vêm do `meta` de cada coluna (ver table-meta.d.ts).
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type RowData,
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@ameciclo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

export type DataColumn<T extends RowData> = ColumnDef<typeof features, T>;

interface Props<T extends RowData> {
  data: T[];
  columns: DataColumn<T>[];
  initialSort: { id: string; desc: boolean };
  // Com `search`, aparece o campo de busca; `text` é o que se compara com o que a pessoa digitou.
  search?: { placeholder: string; text: (row: T) => string };
  isSelected?: (row: T) => boolean;
  emptyText: string;
  // Mostra só as primeiras N linhas (com "mostrar todas"); a busca sempre mostra todas as que combinam.
  collapsedRows?: number;
}

export function DataTable<T extends RowData>({ data, columns, initialSort, search, isSelected, emptyText, collapsedRows }: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const searchText = search?.text;
  const globalFilterFn = useMemo(
    () => (row: { original: T }, _id: string, value: unknown) =>
      searchText ? searchText(row.original).toLocaleLowerCase("pt-BR").includes(String(value).trim().toLocaleLowerCase("pt-BR")) : true,
    [searchText],
  );
  const table = useTable({ features, columns, data, initialState: { sorting: [initialSort] }, globalFilterFn });
  const rows = table.getRowModel().rows;
  const searching = String(table.state.globalFilter ?? "").trim() !== "";
  const shown = collapsedRows && !expanded && !searching ? rows.slice(0, collapsedRows) : rows;

  return (
    <div className="space-y-3">
      {search && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={table.state.globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            className="pl-9"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta;
                  return (
                    <TableHead key={header.id} className={`${meta?.align === "right" ? "text-right" : ""} ${meta?.hideBelowMd ? "hidden md:table-cell" : ""}`}>
                      {header.column.getCanSort() ? (
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
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((row) => (
                <TableRow key={row.id} data-state={isSelected?.(row.original) ? "selected" : undefined}>
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <TableCell key={cell.id} className={`${meta?.align === "right" ? "text-right" : ""} ${meta?.hideBelowMd ? "hidden md:table-cell" : ""}`}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {collapsedRows && !searching && data.length > collapsedRows && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-sm text-ameciclo underline underline-offset-2">
          {expanded ? `Mostrar só as ${collapsedRows} primeiras` : `Mostrar as ${data.length} linhas`}
        </button>
      )}
    </div>
  );
}
