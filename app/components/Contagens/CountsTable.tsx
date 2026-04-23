import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ContagemData } from "~/services/contagens.service";
import { IntlDateStr } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter } from "~/components/Commom/Table/TableFilters";

interface ContagensTableProps {
  data: ContagemData[];
}

const RangeValueFilter = ({ column }: { column: any }) => {
  const filterValue = (column.getFilterValue() as [number | undefined, number | undefined]) ?? [];
  const [min, max] = filterValue;

  return (
    <div className="flex items-center space-x-2 my-2">
      <input
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
        type="number"
        placeholder="Min"
        value={min ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          column.setFilterValue([val ? parseFloat(val) : undefined, max]);
        }}
      />
      <span className="text-gray-500">a</span>
      <input
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
        type="number"
        placeholder="Max"
        value={max ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          column.setFilterValue([min, val ? parseFloat(val) : undefined]);
        }}
      />
    </div>
  );
};

export function CountsTable({ data }: ContagensTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => {
          const slug = row.original.id || `${row.original.id}`;
          return (
            <Link
              className="text-ameciclo hover:underline"
              to="/dados/contagens/$slug"
              params={{ slug: String(slug) }}
            >
              {row.original.name}
            </Link>
          );
        },
        meta: { Filter: (props: any) => <ColumnFilter {...props} placeholder="Buscar por nome" /> },
      },
      {
        header: "Data",
        accessorKey: "date",
        cell: ({ getValue }) => IntlDateStr(getValue() as string),
        meta: { Filter: (props: any) => <ColumnFilter {...props} placeholder="Filtrar por data" /> },
      },
      {
        header: "Total de Ciclistas",
        accessorKey: "total_cyclists",
        filterFn: "numberRange" as any,
        meta: { Filter: RangeValueFilter },
      },
      {
        header: "Dados",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const locationId = row.original.slug?.split("-")[0] || row.original.id;
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
