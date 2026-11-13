import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  columnFilteringFeature,
  constructFilterFn,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  type PaginationState,
  type Row,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronsUpDown,
  CornerDownRight,
  ExternalLink,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type { CountRow } from "@ameciclo/db/derive";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ameciclo/ui/components/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import { cn } from "@ameciclo/ui/lib/utils";
import { plain } from "~/components/Commom/Table/TableFilters";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { SelectCountCell } from "./SelectCountCell";

const features = tableFeatures({
  columnFilteringFeature,
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

// One row per place (and variant, e.g. a lane): its newest count, with the older ones as sub-rows.
type PlaceRow = CountRow & { subRows?: CountRow[] };
type CountColumn = ColumnDef<typeof features, PlaceRow>;
type CountTableRow = Row<typeof features, PlaceRow>;

function newestPerPlace(rows: readonly CountRow[]): PlaceRow[] {
  const series = new Map<string, CountRow[]>();
  for (const row of rows) {
    const key = `${row.id}|${row.variant ?? ""}`;
    series.set(key, [...(series.get(key) ?? []), row]);
  }
  return [...series.values()].map((counts) => {
    const [newest, ...older] = [...counts].sort((a, b) => b.date.localeCompare(a.date));
    return { ...newest, subRows: older };
  });
}

// Matches anywhere in the name, ignoring case and accents (same rule as the legacy tables).
const nameFilter = constructFilterFn({
  filter: (name: string, wanted: string) => plain(name).includes(wanted),
  resolveFilterValue: (value: string) => plain(String(value).trim()),
  autoRemove: (value) => !value,
});

type Range = [number | undefined, number | undefined];

const isRange = (value: unknown): value is Range => Array.isArray(value) && value.length === 2;

const rangeFilter = constructFilterFn({
  filter: (total: number, [min, max]: Range) => (min === undefined || total >= min) && (max === undefined || total <= max),
  autoRemove: ([min, max]: Range) => min === undefined && max === undefined,
});

// The date filter accepts what people read on screen (03/2026) or the stored form (2026-03).
const dateFilter = constructFilterFn({
  filter: (date: string, wanted: string) => `${date} ${IntlDateStr(date)}`.includes(wanted),
  resolveFilterValue: (value: string) => String(value).trim(),
  autoRemove: (value) => !value,
});

const percentFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });

// Change against the previous count of the same place.
function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  if (value === 0) return <span className="text-muted-foreground tabular-nums">0%</span>;
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums", up ? "text-green-700" : "text-red-700")}>
      <Icon className="hidden size-3.5 sm:block" aria-hidden />
      {percentFormat.format(value)}
    </span>
  );
}

// Fixed heights: every place row is the same height whatever it holds (badges, variant, wrapped
// names), so a page of 10 (5 on phones) always takes the same room. Sub-rows are shorter.
const PLACE_ROW_HEIGHT = "h-28 sm:h-16";
const SUB_ROW_HEIGHT = "h-16 sm:h-12";

const SORT_LABEL = { asc: "crescente", desc: "decrescente" };

// With table-layout: fixed the widths below are the real column widths: they do not change with
// the rows on the page ("Local" takes what is left).
const COLUMN_CLASS: Record<string, string> = {
  select: "w-10 pr-0 pl-3",
  name: "whitespace-normal",
  date: "hidden w-36 sm:table-cell",
  total_cyclists: "w-40 sm:w-52",
  change: "hidden w-36 text-right sm:table-cell",
  json: "hidden w-36 text-right md:table-cell",
};

function matchesMobile(onChange: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

type CountsDataTableProps = {
  data: CountRow[];
  // Page-level controls (year, "hide estimated") rendered before the search box.
  filters?: ReactNode;
  // Rendered at the end of the toolbar row (e.g. the CSV link).
  actions?: ReactNode;
  // Replaces the per-row "JSON" link (e.g. a "compare only these two" shortcut).
  rowAction?: (row: CountRow) => ReactNode;
  // Without the CSV/year toolbar the table can sit anywhere; this labels it for screen readers.
  label?: string;
};

export function CountsDataTable({ data, filters, actions, rowAction, label }: CountsDataTableProps) {
  const places = useMemo(() => newestPerPlace(data), [data]);
  const maxTotal = useMemo(() => Math.max(1, ...data.map((c) => c.total_cyclists)), [data]);
  const mobile = useSyncExternalStore(matchesMobile, isMobile, () => false);
  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pagination: PaginationState = { pageIndex, pageSize: mobile ? 5 : 10 };

  const columns = useMemo<CountColumn[]>(
    () => [
      {
        id: "select",
        header: () => <span className="sr-only">Selecionar</span>,
        cell: ({ row }) => <SelectCountCell row={row.original} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Local",
        filterFn: nameFilter,
        cell: ({ row }) => <NameCell row={row} />,
      },
      {
        id: "date",
        accessorKey: "date",
        header: "Data",
        filterFn: dateFilter,
        cell: ({ row }) => <span className="tabular-nums">{IntlDateStr(row.original.date)}</span>,
      },
      {
        id: "total_cyclists",
        accessorKey: "total_cyclists",
        header: "Ciclistas",
        filterFn: rangeFilter,
        cell: ({ row }) => <TotalCell count={row.original} maxTotal={maxTotal} />,
      },
      {
        id: "change",
        // Places without a previous count sort below every real change.
        accessorFn: (row) => row.change ?? Number.NEGATIVE_INFINITY,
        header: "Variação",
        sortFn: "basic",
        enableColumnFilter: false,
        cell: ({ row }) => <Change value={row.original.change} />,
      },
      {
        id: "json",
        header: () => <span className="sr-only">Dados</span>,
        cell: ({ row }) =>
          rowAction ? (
            rowAction(row.original)
          ) : (
          <a
            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
            href={`/api/contagens/${row.original.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Dados em JSON de ${row.original.name}`}
          >
            JSON
            <ExternalLink className="size-3" aria-hidden />
          </a>
          ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [maxTotal, rowAction],
  );

  const table = useTable({
    features,
    columns,
    data: places,
    getSubRows: (row) => row.subRows,
    enableSortingRemoval: false,
    paginateExpandedRows: false,
    state: { pagination },
    onPaginationChange: (updater) => setPageIndex((updater instanceof Function ? updater(pagination) : updater).pageIndex),
    initialState: { sorting: [{ id: "date", desc: true }] },
  });

  const nameColumn = table.getColumn("name");
  const totalColumn = table.getColumn("total_cyclists");
  const dateColumn = table.getColumn("date");
  const nameValue = String(nameColumn?.getFilterValue() ?? "");
  const totalFilter = totalColumn?.getFilterValue();
  const [min, max]: Range = isRange(totalFilter) ? totalFilter : [undefined, undefined];
  const dateValue = String(dateColumn?.getFilterValue() ?? "");
  const advancedActive = [min !== undefined || max !== undefined, dateValue !== ""].filter(Boolean).length;
  const anyActive = advancedActive > 0 || nameValue !== "";

  const resetPage = () => setPageIndex(0);
  const rows = table.getRowModel().rows;
  const placeCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {(filters || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {filters}
          {actions}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            aria-label="Buscar por nome do local"
            placeholder="Buscar por nome do local"
            className="h-10 bg-background pl-9"
            value={nameValue}
            onChange={(e) => {
              nameColumn?.setFilterValue(e.target.value || undefined);
              resetPage();
            }}
          />
        </div>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 bg-background">
              <SlidersHorizontal aria-hidden />
              Mais filtros
              {advancedActive > 0 && <Badge className="ml-1 px-1.5">{advancedActive}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="theme-ameciclo w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
            <div className="space-y-5 p-5">
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">Total de ciclistas</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="filtro-total-min" className="text-xs text-muted-foreground">
                      Mínimo
                    </Label>
                    <Input
                      id="filtro-total-min"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="0"
                      className="h-10"
                      value={min ?? ""}
                      onChange={(e) => {
                        totalColumn?.setFilterValue([e.target.value ? Number(e.target.value) : undefined, max]);
                        resetPage();
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="filtro-total-max" className="text-xs text-muted-foreground">
                      Máximo
                    </Label>
                    <Input
                      id="filtro-total-max"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Sem limite"
                      className="h-10"
                      value={max ?? ""}
                      onChange={(e) => {
                        totalColumn?.setFilterValue([min, e.target.value ? Number(e.target.value) : undefined]);
                        resetPage();
                      }}
                    />
                  </div>
                </div>
              </fieldset>
              <div className="space-y-3">
                <Label htmlFor="filtro-data" className="text-sm font-semibold">
                  Data da contagem
                </Label>
                <Input
                  id="filtro-data"
                  className="h-10"
                  placeholder="Ex.: 03/2026 ou 2026-03"
                  value={dateValue}
                  onChange={(e) => {
                    dateColumn?.setFilterValue(e.target.value || undefined);
                    resetPage();
                  }}
                />
                <p className="text-xs text-muted-foreground">Digite o mês e o ano, ou só o ano.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t bg-muted/60 px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={advancedActive === 0}
                onClick={() => {
                  totalColumn?.setFilterValue(undefined);
                  dateColumn?.setFilterValue(undefined);
                  resetPage();
                }}
              >
                Limpar filtros
              </Button>
              <Button size="sm" onClick={() => setFiltersOpen(false)}>
                Concluir
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {anyActive && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => {
              table.resetColumnFilters(true);
              resetPage();
            }}
          >
            <X aria-hidden />
            Limpar
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <Table aria-label={label} className="table-fixed">
          <TableHeader className="bg-accent/60">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const right = header.column.id === "change" || header.column.id === "json";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn("h-11", COLUMN_CLASS[header.column.id])}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-sm text-xs font-bold tracking-wider text-accent-foreground uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            right && "ml-auto",
                          )}
                          title={sorted ? `Ordenado de forma ${SORT_LABEL[sorted]}; clique para inverter` : "Clique para ordenar"}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b!">
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className={cn("text-center text-muted-foreground", mobile ? "h-[34rem]" : "h-[40rem]")}
                >
                  Nenhuma contagem encontrada com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    row.depth > 0 ? SUB_ROW_HEIGHT : PLACE_ROW_HEIGHT,
                    row.depth > 0 && "bg-muted/70 text-muted-foreground",
                    row.depth === 0 && row.getIsExpanded() && "bg-accent/40",
                  )}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("py-2", COLUMN_CLASS[cell.column.id], row.depth > 0 && cell.column.id === "select" && "pl-6")}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {/* Filler rows keep the table (and the footer below it) the same height on every page. */}
            {rows.length > 0 &&
              Array.from({ length: Math.max(0, pagination.pageSize - rows.filter((r) => r.depth === 0).length) }, (_, i) => (
                <TableRow key={`filler-${i}`} aria-hidden className={cn(PLACE_ROW_HEIGHT, "hover:bg-transparent")}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span aria-live="polite">
          {placeCount === places.length
            ? `${placeCount} locais · ${data.length} contagens`
            : `${placeCount} de ${places.length} locais`}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <span>
              Página {pagination.pageIndex + 1} de {pageCount}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NameCell({ row }: { row: CountTableRow }) {
  const count = row.original;
  if (row.depth > 0) {
    return (
      <Link
        to="/dados/contagens/$slug"
        params={{ slug: count.slug }}
        className="inline-flex flex-wrap items-center gap-x-1.5 pl-3 text-sm hover:text-primary hover:underline"
      >
        <CornerDownRight className="size-3.5" aria-hidden />
        {count.variant ?? "mesma esquina"}
        <span className="text-xs sm:hidden">{IntlDateStr(count.date)}</span>
      </Link>
    );
  }
  const older = count.subRows?.length ?? 0;
  const expanded = row.getIsExpanded();
  return (
    <div className="space-y-1">
      <Link
        to="/dados/contagens/$slug"
        params={{ slug: count.slug }}
        className="block font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="line-clamp-2 sm:line-clamp-1" title={count.variant ? `${count.name} (${count.variant})` : count.name}>
          {count.name}
          {count.variant && <span className="font-normal text-muted-foreground"> ({count.variant})</span>}
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:hidden">{IntlDateStr(count.date)}</div>
      {older > 0 && (
        <button
          type="button"
          onClick={() => row.toggleExpanded()}
          aria-expanded={expanded}
          className="flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} aria-hidden />
          {older} {older === 1 ? "anterior" : "anteriores"}
        </button>
      )}
    </div>
  );
}

function TotalCell({ count, maxTotal }: { count: CountRow; maxTotal: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold tabular-nums">{IntlNumber(count.total_cyclists)}</span>
        <span className="text-xs sm:hidden">
          <Change value={count.change} />
        </span>
        {count.note && (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
            {count.note}
          </Badge>
        )}
      </div>
      <div className="h-1 w-full max-w-28 overflow-hidden rounded-full bg-accent" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${(count.total_cyclists / maxTotal) * 100}%` }} />
      </div>
    </div>
  );
}
