import type { CountRow } from "@ameciclo/db/derive";
import { Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter } from "~/components/Commom/Table/TableFilters";

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

// Counts of the same place stay together, newest first, so the table reads place by place.
function groupedByPlace(rows: readonly CountRow[]): CountRow[] {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id || b.date.localeCompare(a.date));
}

export function CountsTable({ data }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const grouped = useMemo(() => groupedByPlace(data), [data]);

  const columns = useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row, page }: any) => {
          // Another count of the place right above (in whatever order and page is on screen):
          // tie it to that row instead of repeating the name.
          const position = page.findIndex((r: any) => r.id === row.id);
          const repeat = position > 0 && page[position - 1].original.id === row.original.id;
          return (
            <Link
              className={repeat ? "pl-6 text-gray-500 hover:underline" : "text-ameciclo hover:underline"}
              to="/dados/contagens/$slug"
              params={{ slug: row.original.slug }}
            >
              {repeat ? (
                <>↳ {row.original.variant ?? "mesma esquina"}</>
              ) : (
                <>
                  {row.original.name}
                  {row.original.variant && <span className="text-gray-500"> ({row.original.variant})</span>}
                </>
              )}
            </Link>
          );
        },
        Filter: (props: any) => <ColumnFilter {...props} placeholder="Buscar por nome" />,
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
      data={grouped}
      columns={columns}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    />
  );
}