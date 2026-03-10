import { Link } from "@remix-run/react";
import React, { useState, useMemo } from "react";
import type { ContagemData } from "~/services/contagens.service";
import { IntlDateStr } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter } from "~/components/Commom/Table/TableFilters";

interface ContagensTableProps {
  data: ContagemData[];
}

// Componente de filtro de valor aproximado adaptado para a tabela de contagens
const RangeValueFilter = ({ column }: any) => {
  const { filterValue = [], setFilter, id } = column;
  const [min, max] = filterValue;
  const minId = `range-min-${id}`;
  const maxId = `range-max-${id}`;

  return (
    <div className="flex items-center space-x-2 my-2">
      <label htmlFor={minId} className="sr-only">Valor mínimo</label>
      <input
        id={minId}
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
        type="number"
        placeholder="Min"
        value={min || ''}
        onChange={(e) => {
          const val = e.target.value;
          setFilter([val ? parseFloat(val) : undefined, max]);
        }}
        aria-label="Valor mínimo"
      />
      <span className="text-gray-500">a</span>
      <label htmlFor={maxId} className="sr-only">Valor máximo</label>
      <input
        id={maxId}
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
        type="number"
        placeholder="Max"
        value={max || ''}
        onChange={(e) => {
          const val = e.target.value;
          setFilter([min, val ? parseFloat(val) : undefined]);
        }}
        aria-label="Valor máximo"
      />
    </div>
  );
};

export function CountsTable({ data }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: any) => {
          // Generate slug from ID and name if slug doesn't exist
          const slug = row.original.id || `${row.original.id}`;
          return (
            <Link
              className="text-ameciclo hover:underline"
              to={`/dados/contagens/${slug}`}
            >
              {row.original.name}
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
        Header: "Dados",
        accessor: "id",
        Cell: ({ row }: any) => {
          const locationId = row.original.slug?.split('-')[0] || row.original.id;
          return (
            <a
              className="text-ameciclo hover:underline"
              href={`https://cyclist-counts.atlas.ameciclo.org/v1/locations/${locationId}`}
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
    />
  );
}