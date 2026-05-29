import { Link } from "@tanstack/react-router";
import React, { useState, useMemo, useCallback } from "react";
import type { ContagemData } from "~/services/contagens.service";
import { IntlDateStr } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter } from "~/components/Commom/Table/TableFilters";
import { COUNTINGS_ATLAS_LOCATION } from "~/servers";
import { parseCountIdFromSlug } from "~/services/slug";

interface ContagensTableProps {
  data: ContagemData[];
  onCoordinateClick?: (lat: number, lng: number) => void;
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

export function CountsTable({ data, onCoordinateClick }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const stateReducer = useCallback(
    (newState: any, action: any) => {
      switch (action.type) {
        case 'setFilter':
        case 'setAllFilters':
        case 'setColumnFilters':
        case 'columnFiltering': {
          for (const row of data) {
            if (row.count_total! > 1 && row.subRows?.length) {
              const lower = (action.filterValue || '').toLowerCase();
              if (!lower) break;
              const hasMatch = row.subRows.some(
                (child: any) => String(child.date || '').toLowerCase().includes(lower),
              );
              if (hasMatch) {
                newState.expanded = { ...newState.expanded, [row.name]: true };
              }
            }
          }
          break;
        }
      }
      return newState;
    },
    [data],
  );

  const columns = useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-2" style={{ paddingLeft: (row.depth || 0) * 18 }}>
              {row.canExpand ? (
                <button {...row.getToggleRowExpandedProps()} className="text-gray-400 hover:text-gray-600 w-4 shrink-0 text-xs leading-none">
                  {row.isExpanded ? '\u25BE' : '\u25B8'}
                </button>
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <Link
                className="text-ameciclo hover:underline"
                to="/dados/contagens/$slug"
                params={{ slug: row.original.slug }}
              >
                {row.original.name}
              </Link>
              {row.original.count_total! > 1 && !row.depth && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                  {row.original.count_total}
                </span>
              )}
            </div>
          );
        },
        Filter: (props: any) => <ColumnFilter {...props} placeholder="Buscar por nome" />,
      },
      {
        Header: "Data",
        accessor: "date",
        Cell: ({ value }: any) => IntlDateStr(value),
        Filter: (props: any) => <ColumnFilter {...props} placeholder="Filtrar por data" />,
        filter: (rows: any[], id: string, filterValue: string) => {
          if (!filterValue) return rows;
          const lower = filterValue.toLowerCase();
          return rows.filter((row) => {
            if (String(row.values[id] || '').toLowerCase().includes(lower)) return true;
            for (const child of row.subRows || []) {
              if (String(child.values[id] || '').toLowerCase().includes(lower)) return true;
            }
            return false;
          });
        },
      },
      {
        Header: "Total de Ciclistas",
        accessor: "total_cyclists",
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
        Header: "Coord.",
        accessor: "latitude",
        Cell: ({ row }: any) => {
          const lat = parseFloat(row.original.latitude);
          const lng = parseFloat(row.original.longitude);
          if (isNaN(lat) || isNaN(lng)) return <span className="text-gray-300">—</span>;
          return (
            <button
              onClick={() => onCoordinateClick?.(lat, lng)}
              className="text-ameciclo hover:underline text-xs cursor-pointer"
              title="Centralizar mapa neste ponto"
            >
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </button>
          );
        },
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Dados",
        accessor: "id",
        Cell: ({ row }: any) => {
          const countId = parseCountIdFromSlug(row.original.slug);
          return (
            <a
              className="text-ameciclo hover:underline"
              href={COUNTINGS_ATLAS_LOCATION(countId)}
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
      data={data}
      columns={columns}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      expandMode="subrows"
      stateReducer={stateReducer}
    />
  );
}