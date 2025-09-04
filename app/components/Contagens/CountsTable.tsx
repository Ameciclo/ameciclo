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
  const { filterValue = [], setFilter } = column;
  const [min, max] = filterValue;

  return (
    <div className="flex items-center space-x-2 my-2">
      <input
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
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
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
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

export function CountsTable({ data }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: any) => (
          <Link
            className="text-ameciclo hover:underline"
            to={`/dados/contagens/${row.original.slug}`}
          >
            {row.original.name}
          </Link>
        ),
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
        Cell: ({ value }: any) => (
          <a
            className="text-ameciclo hover:underline"
            href={`https://api.garfo.ameciclo.org/cyclist-counts/edition/${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            JSON
          </a>
        ),
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