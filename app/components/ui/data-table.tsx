import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Initial page size (defaults to 10) */
  pageSize?: number;
  /** Enables the pagination controls (defaults to true) */
  pagination?: boolean;
  /** Copy shown when data is empty */
  emptyMessage?: string;
  /** Optional className overrides */
  className?: string;
  /** Optional per-row className — useful for type-based coloring */
  rowClassName?: (row: TData) => string | undefined;
  /**
   * Optional render-prop for a toolbar above the table. Receives the TanStack
   * table instance so the consumer can wire up filter inputs, selects, etc.
   * Example:
   *   toolbar={(table) => (
   *     <MyFilters onChange={v => table.getColumn("x")?.setFilterValue(v)} />
   *   )}
   */
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pagination = true,
  emptyMessage = "Nenhum resultado encontrado.",
  className,
  rowClassName,
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    initialState: { pagination: { pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className={className}>
      {toolbar && <div className="mb-4">{toolbar(table)}</div>}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100 hover:bg-gray-100">
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  const canSort = column.getCanSort();
                  const isSorted = column.getIsSorted();
                  const headerText =
                    typeof column.columnDef.header === "string" ? column.columnDef.header : "coluna";
                  return (
                    <TableHead key={header.id}>
                      {canSort ? (
                        <button
                          onClick={column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]"
                          aria-label={`Ordenar por ${headerText}${
                            isSorted === "desc"
                              ? " em ordem decrescente"
                              : isSorted === "asc"
                              ? " em ordem crescente"
                              : ""
                          }`}
                          aria-sort={
                            isSorted === "desc" ? "descending" : isSorted === "asc" ? "ascending" : "none"
                          }
                        >
                          <span className="inline-flex w-4 h-4 items-center justify-center shrink-0">
                            {isSorted === "desc" ? (
                              <ChevronDown size={16} className="text-gray-600" aria-hidden="true" />
                            ) : isSorted === "asc" ? (
                              <ChevronUp size={16} className="text-gray-600" aria-hidden="true" />
                            ) : (
                              <ChevronsUpDown size={16} className="text-gray-400" aria-hidden="true" />
                            )}
                          </span>
                          {flexRender(column.columnDef.header, header.getContext())}
                        </button>
                      ) : (
                        flexRender(column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={rowClassName?.(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {pagination && pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="text-xs text-gray-500">
              {table.getFilteredRowModel().rows.length} resultados • Página {pageIndex + 1} de {Math.max(pageCount, 1)}
            </div>
            <div className="flex items-center space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  table.getCanPreviousPage() ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ← Anterior
              </button>
              <button
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  table.getCanNextPage() ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
