import { Search } from "lucide-react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  type ColumnDef,
  columnFilteringFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  type Row,
  type RowData,
  rowExpandingFeature,
  rowSortingFeature,
  type SortingState,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Button } from "@ameciclo/ui/components/button";
import { Input } from "@ameciclo/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ameciclo/ui/components/table";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowExpandingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

export type TableColumn<TData extends RowData> = ColumnDef<typeof features, TData>;
export type TableRowOf<TData extends RowData> = Row<typeof features, TData>;

type DataTableProps<TData extends RowData> = {
  columns: TableColumn<TData>[];
  data: TData[];
  filterPlaceholder?: string;
  pageSize?: number;
  initialSorting?: SortingState;
  toolbar?: React.ReactNode;
  emptyLabel?: string;
  getSubRows?: (row: TData) => TData[] | undefined;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterPlaceholder,
  pageSize = 25,
  initialSorting = [],
  toolbar,
  emptyLabel = "Nenhum resultado.",
  getSubRows,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,
    getSubRows,
    initialState: { sorting: initialSorting, expanded: true, pagination: { pageIndex: 0, pageSize } },
  });
  const globalFilter = table.state.globalFilter ?? "";

  const rows = table.getRowModel().rows;
  const filtered = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {(filterPlaceholder || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {filterPlaceholder ? (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                placeholder={filterPlaceholder}
                className="pl-9"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar}
        </div>
      )}

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.headClassName}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          )}
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
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
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
            {filtered.toLocaleString("pt-BR")} de {data.length.toLocaleString("pt-BR")} · página{" "}
            {table.state.pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
