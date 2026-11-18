// The two tables of the observatory: the PDC projects of the selected municipality, and every municipality.
import { Link } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";
import {
  type ColumnDef,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Input } from "@ameciclo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import type { CyclingCityStats, CyclingProjectRow } from "@ameciclo/db/cycling-read";
import { kmValue, percent } from "./status";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

const matches = (text: string, query: unknown) =>
  text.toLocaleLowerCase("pt-BR").includes(String(query).trim().toLocaleLowerCase("pt-BR"));

/** A small bar next to a share of 0 to 100. */
function ShareBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-muted sm:w-16" aria-hidden="true">
        <div className="h-full rounded-full bg-ameciclo" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="tabular-nums">{percent(value)}</span>
    </div>
  );
}

function SortHead({
  header,
  right,
  render,
  hideOnMobile = false,
}: {
  header: { column: { getCanSort: () => boolean; getIsSorted: () => false | "asc" | "desc"; getToggleSortingHandler: () => ((e: unknown) => void) | undefined } };
  right: boolean;
  render: ReactNode;
  hideOnMobile?: boolean;
}) {
  const sorted = header.column.getIsSorted();
  return (
    <TableHead className={`whitespace-normal ${right ? "text-right" : ""} ${hideOnMobile ? "hidden sm:table-cell" : ""}`.trim()} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}>
      {header.column.getCanSort() ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className={`inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground ${right ? "flex-row-reverse" : ""}`}
        >
          {render}
          {sorted === "asc" ? (
            <ArrowUp className="size-3" />
          ) : sorted === "desc" ? (
            <ArrowDown className="size-3" />
          ) : (
            <ChevronsUpDown className="size-3 opacity-40" />
          )}
        </button>
      ) : (
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{render}</span>
      )}
    </TableHead>
  );
}

// ---------------------------------------------------------------------------
// PDC projects of one municipality
// ---------------------------------------------------------------------------

type ProjectRow = CyclingProjectRow & { share: number };
const PROJECT_NUMBERS = new Set(["plannedKm", "builtKm"]);
// On a phone the typologies move under the project's name and the planned length joins the built one ("2,0 de 3,7").
const PROJECT_HIDE_ON_MOBILE = new Set(["plannedTypology", "builtTypologies", "plannedKm"]);

export function ProjectsTable({ projects, cityName }: { projects: CyclingProjectRow[]; cityName: string }) {
  const data = useMemo<ProjectRow[]>(
    () => projects.map((p) => ({ ...p, share: p.plannedKm > 0 ? (p.builtKm / p.plannedKm) * 100 : 0 })),
    [projects],
  );

  const columns = useMemo<ColumnDef<typeof features, ProjectRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Projeto",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <div className="whitespace-normal">
            {row.original.name}
            <span className="ml-1.5 text-xs text-muted-foreground">{row.original.ref}</span>
            <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
              {row.original.plannedTypology} prevista · {row.original.builtTypologies || "nenhuma"} implantada
            </div>
          </div>
        ),
      },
      { accessorKey: "plannedTypology", header: "Prevista", sortingFn: "alphanumeric" },
      {
        accessorKey: "builtTypologies",
        header: "Implantada",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <div className="whitespace-normal">
            {row.original.builtTypologies || <span className="text-muted-foreground">Nenhuma</span>}
          </div>
        ),
      },
      {
        accessorKey: "plannedKm",
        header: "Previsto (km)",
        cell: ({ row }) => <span className="tabular-nums">{kmValue(row.original.plannedKm)}</span>,
      },
      {
        // Sorts by how much was built; under the number, how much that is of the project.
        accessorKey: "builtKm",
        header: "Implantado (km)",
        cell: ({ row }) => (
          <div className="tabular-nums">
            {kmValue(row.original.builtKm)}
            <span className="sm:hidden"> de {kmValue(row.original.plannedKm)}</span>
            <div className="text-xs text-muted-foreground">{percent(row.original.share)} do projeto</div>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useTable({
    features,
    columns,
    data,
    initialState: { sorting: [{ id: "plannedKm", desc: true }], pagination: { pageIndex: 0, pageSize: 12 } },
    globalFilterFn: (row, _columnId, value) => matches(`${row.original.name} ${row.original.ref}`, value),
  });
  const rows = table.getRowModel().rows;
  const found = table.getFilteredRowModel().rows.length;
  const pages = table.getPageCount();
  const page = table.state.pagination.pageIndex;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Projetos do PDC em {cityName}</h3>
          <p className="text-sm text-gray-500">
            {projects.length === 0
              ? "O PDC não tem projetos neste município."
              : `${projects.length} ${projects.length === 1 ? "projeto" : "projetos"}. O que cada um prevê e o que existe hoje nele.`}
          </p>
        </div>
        {projects.length > 0 && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={table.state.globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder="Buscar projeto ou código"
              aria-label="Buscar projeto ou código"
              className="pl-9"
            />
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <SortHead
                      key={header.id}
                      header={header}
                      right={PROJECT_NUMBERS.has(header.column.id)}
                      hideOnMobile={PROJECT_HIDE_ON_MOBILE.has(header.column.id)}
                      render={<table.FlexRender header={header} />}
                    />
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum projeto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`${PROJECT_NUMBERS.has(cell.column.id) ? "text-right" : ""} ${PROJECT_HIDE_ON_MOBILE.has(cell.column.id) ? "hidden sm:table-cell" : ""}`.trim() || undefined}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-sm text-muted-foreground">
            <span className="tabular-nums">
              {found === projects.length ? `${found} projetos` : `${found} de ${projects.length} projetos`}
              {pages > 1 && ` · página ${page + 1} de ${pages}`}
            </span>
            {pages > 1 && (
              <div className="flex gap-2">
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
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Every municipality
// ---------------------------------------------------------------------------

const CITY_NUMBERS = new Set(["executedInPdcKm", "plannedKm", "outsidePdcKm", "existingKm"]);
// The columns that can wait for a wider screen; the municipality and its share of the PDC stay.
const CITY_HIDE_ON_MOBILE = new Set(["executedInPdcKm", "plannedKm", "outsidePdcKm", "existingKm"]);

/** Every municipality of the RMR. Clicking one selects it in the explorer above. */
export function CitiesTable({ cities, selectedIbge }: { cities: CyclingCityStats[]; selectedIbge: number }) {
  const columns = useMemo<ColumnDef<typeof features, CyclingCityStats>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Município",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <Link
            to="/dados/execucaocicloviaria"
            search={(prev) => ({ ...prev, cidade: row.original.ibge })}
            hash="explorador"
            resetScroll={false}
            className={row.original.ibge === selectedIbge ? "font-semibold text-ameciclo hover:underline" : "hover:underline"}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "percent",
        header: "Do PDC implantado",
        cell: ({ row }) => <ShareBar value={row.original.percent} />,
      },
      {
        accessorKey: "executedInPdcKm",
        header: "Implantado (km)",
        cell: ({ row }) => <span className="tabular-nums">{kmValue(row.original.executedInPdcKm)}</span>,
      },
      {
        accessorKey: "plannedKm",
        header: "No PDC (km)",
        cell: ({ row }) => <span className="tabular-nums">{kmValue(row.original.plannedKm)}</span>,
      },
      {
        accessorKey: "outsidePdcKm",
        header: "Fora do PDC (km)",
        cell: ({ row }) => <span className="tabular-nums">{kmValue(row.original.outsidePdcKm)}</span>,
      },
      {
        accessorKey: "existingKm",
        header: "Existente (km)",
        cell: ({ row }) => <span className="tabular-nums">{kmValue(row.original.existingKm)}</span>,
      },
    ],
    [selectedIbge],
  );

  const table = useTable({
    features,
    columns,
    data: cities,
    initialState: { sorting: [{ id: "percent", desc: true }] },
    globalFilterFn: (row, _columnId, value) => matches(row.original.name, value),
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={table.state.globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Buscar município"
          aria-label="Buscar município"
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <SortHead
                    key={header.id}
                    header={header}
                    right={CITY_NUMBERS.has(header.column.id)}
                    hideOnMobile={CITY_HIDE_ON_MOBILE.has(header.column.id)}
                    render={<table.FlexRender header={header} />}
                  />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum município encontrado.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.original.ibge === selectedIbge ? "selected" : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${CITY_NUMBERS.has(cell.column.id) ? "text-right" : ""} ${CITY_HIDE_ON_MOBILE.has(cell.column.id) ? "hidden sm:table-cell" : ""}`.trim() || undefined}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
