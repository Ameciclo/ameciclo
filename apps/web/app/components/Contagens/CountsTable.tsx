import type { CountRow } from "@ameciclo/db/derive";
import { Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import { CompareCheckbox } from "~/components/Contagens/comparison/CompareCheckbox";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter, containsText } from "~/components/Commom/Table/TableFilters";

interface ContagensTableProps {
  data: CountRow[];
}

const percentFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });

// Change against the previous count of the same place.
function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">-</span>;
  const tone = value > 0 ? "text-green-700" : value < 0 ? "text-red-600" : "text-gray-600";
  return <span className={tone}>{percentFormat.format(value)}</span>;
}

// Componente de filtro de valor aproximado adaptado para a tabela de contagens
const RangeValueFilter = ({ column }: any) => {
  const { filterValue = [], setFilter } = column;
  const [min, max] = filterValue;

  return (
    <div className="flex items-center space-x-2 my-2">
      <input
        className="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm focus:outline-hidden"
        type="number"
        placeholder="Min"
        value={min || ''}
        onChange={(e) => {
          const val = e.target.value;
          setFilter([val ? parseFloat(val) : undefined, max]);
        }}
      />
      <span className="text-gray-500">a</span>
      <input
        className="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm focus:outline-hidden"
        type="number"
        placeholder="Max"
        value={max || ''}
        onChange={(e) => {
          const val = e.target.value;
          setFilter([min, val ? parseFloat(val) : undefined]);
        }}
      />
    </div>
  );
};

// Newest count first; the "Data" header shows (and can reverse) this order.
const NEWEST_FIRST = [{ id: "date", desc: true }];

type PlaceRow = CountRow & { subRows: CountRow[] };

// One row per place (and variant, e.g. a lane): its newest count, with the older ones as
// sub-rows that open on click. Sorting then orders places by their newest count.
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

export function CountsTable({ data }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const places = useMemo(() => newestPerPlace(data), [data]);

  const columns = useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: any) =>
          row.depth > 0 ? (
            <Link
              className="pl-6 text-gray-500 hover:underline"
              to="/dados/contagens/$slug"
              params={{ slug: row.original.slug }}
            >
              ↳ {row.original.variant ?? "mesma esquina"}
            </Link>
          ) : (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                className="text-ameciclo hover:underline"
                to="/dados/contagens/$slug"
                params={{ slug: row.original.slug }}
              >
                {row.original.name}
                {row.original.variant && <span className="text-gray-500"> ({row.original.variant})</span>}
              </Link>
              {row.original.subRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => row.toggleRowExpanded()}
                  aria-expanded={row.isExpanded}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                >
                  {row.isExpanded ? "▾" : "▸"} {row.original.subRows.length} {row.original.subRows.length === 1 ? "anterior" : "anteriores"}
                </button>
              )}
            </span>
          ),
        Filter: (props: any) => <ColumnFilter {...props} placeholder="Buscar por nome" />,
        filter: containsText,
      },
      {
        Header: "Data",
        accessor: "date",
        Cell: ({ value }: any) => IntlDateStr(value),
        Filter: (props: any) => <ColumnFilter {...props} placeholder="Filtrar por data" />,
      },
      {
        Header: "Total de Ciclistas",
        accessor: "total_cyclists",
        Cell: ({ row }: any) => (
          <span className="inline-flex items-center gap-2">
            {IntlNumber(row.original.total_cyclists)}
            {row.original.note && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {row.original.note}
              </span>
            )}
          </span>
        ),
        Filter: RangeValueFilter,
        filter: (rows: any, id: any, filterValue: any) => {
          const [min, max] = filterValue || [];
          return rows.filter((row: any) => {
            const rowValue = parseFloat(row.values[id]) || 0;
            if (min !== undefined && rowValue < min) return false;
            if (max !== undefined && rowValue > max) return false;
            return true;
          });
        },
      },

      {
        Header: "Variação",
        accessor: "change",
        Cell: ({ row }: any) => <Change value={row.original.change} />,
        disableFilters: true,
        sortType: (a: any, b: any) => (a.original.change ?? -Infinity) - (b.original.change ?? -Infinity),
      },
      {
        Header: "Comparar",
        accessor: "compare",
        Cell: ({ row }: any) => <CompareCheckbox item={row.original} />,
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Dados",
        accessor: "id",
        Cell: ({ row }: any) => {
          const locationId = row.original.id;
          return (
            <a
              className="text-ameciclo hover:underline"
              href={`/api/contagens/${locationId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              JSON
            </a>
          );
        },
        disableFilters: true,
        disableSortBy: true,
      },
    ],
    []
  );

  return (
    <Table
      title="Contagens de Ciclistas"
      data={places}
      initialSortBy={NEWEST_FIRST}
      columns={columns}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    />
  );
}