// O ranking das vias: shadcn Table com TanStack Table v9, como a tabela de municípios do SAMU. Ordena por qualquer coluna
// (clique de novo para inverter), busca pelo nome e abre a via ao clicar nela.
import { useMemo, useState } from "react";
import {
  type ColumnDef,
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
import type { UnsafeStreet } from "@ameciclo/db";
import { MIN_RATE_CALLS, MIN_RATE_KM, viaSlug } from "~/queries/dados.vias-inseguras";
import { km, n, pct, perKm } from "./labels";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

const FIRST_ROWS = 20;
const RIGHT = new Set(["rank", "calls", "share", "length", "perKm"]);
// Em telas estreitas ficam só a via, os chamados e o "por km".
const WIDE_ONLY = new Set(["share", "length"]);

interface Props {
  streets: UnsafeStreet[];
  identified: number;
  selectedKey: string | undefined;
  onSelect: (slug: string) => void;
}

export function RankingTable({ streets, identified, selectedKey, onSelect }: Props) {
  const [all, setAll] = useState(false);

  const columns = useMemo<ColumnDef<typeof features, UnsafeStreet>[]>(
    () => [
      // A posição é a do ranking por chamados: não muda ao ordenar, para ver como a ordem se move.
      { accessorKey: "rank", header: "#", cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.rank}</span> },
      {
        accessorKey: "name",
        header: "Via",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onSelect(viaSlug(row.original.name))}
            className={`text-left underline-offset-2 hover:underline ${row.original.key === selectedKey ? "font-semibold text-ameciclo" : "text-ameciclo"}`}
          >
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: "calls", header: "Chamados", cell: ({ row }) => <span className="font-semibold tabular-nums">{n(row.original.calls)}</span> },
      { id: "share", header: "% do total", accessorFn: (s) => s.calls, enableSorting: false, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{pct(row.original.calls, identified)}</span> },
      // Sem extensão (ou, no "por km", via curta demais): vazio, e sempre no fim, qualquer que seja o sentido.
      { id: "length", header: "Extensão (km)", accessorFn: (s) => s.lengthKm ?? undefined, sortUndefined: "last", cell: ({ row }) => <span className="tabular-nums">{km(row.original.lengthKm)}</span> },
      { id: "perKm", header: "Por km", accessorFn: (s) => s.callsPerKm ?? undefined, sortUndefined: "last", cell: ({ row }) => <span className="tabular-nums">{perKm(row.original.callsPerKm)}</span> },
    ],
    [identified, selectedKey, onSelect],
  );

  const table = useTable({
    features,
    columns,
    data: streets,
    initialState: { sorting: [{ id: "calls", desc: true }] },
    globalFilterFn: (row, _columnId, value) => row.original.name.toLocaleLowerCase("pt-BR").includes(String(value).trim().toLocaleLowerCase("pt-BR")),
  });
  const rows = table.getRowModel().rows;
  const searching = String(table.state.globalFilter ?? "").trim() !== "";
  const shown = all || searching ? rows : rows.slice(0, FIRST_ROWS);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={table.state.globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Buscar via"
          aria-label="Buscar via no ranking"
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const id = header.column.id;
                  return (
                    <TableHead key={header.id} className={`${RIGHT.has(id) ? "text-right" : ""} ${WIDE_ONLY.has(id) ? "hidden md:table-cell" : ""}`}>
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
                  Nenhuma via encontrada.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((row) => (
                <TableRow key={row.id} data-state={row.original.key === selectedKey ? "selected" : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={`${RIGHT.has(cell.column.id) ? "text-right" : ""} ${WIDE_ONLY.has(cell.column.id) ? "hidden md:table-cell" : ""}`}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        O “#” é a posição no ranking por chamados e não muda ao ordenar. “Por km” só aparece para vias de {km(MIN_RATE_KM)} km ou mais e com {MIN_RATE_CALLS} chamados ou mais: numa via curta, poucos chamados dão um número enorme. Essas vias, e as sem extensão na malha, ficam no fim quando a ordem é por extensão ou por km.
      </p>
      {!searching && streets.length > FIRST_ROWS && (
        <button type="button" onClick={() => setAll((v) => !v)} className="text-sm text-ameciclo underline underline-offset-2">
          {all ? `Mostrar só as ${FIRST_ROWS} primeiras` : `Mostrar as ${streets.length} vias do ranking`}
        </button>
      )}
    </div>
  );
}
