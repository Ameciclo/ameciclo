"use client";
import React from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ColumnFilter, NumberRangeColumnFilter } from "~/components/Commom/Table/TableFilters";
import Table from "~/components/Commom/Table/Table";
import { IntlDateStr } from "~/services/utils";

export const CountingComparisionTable = ({ data, firstSlug }: { data: any[]; firstSlug: string }) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = React.useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => (
          <Link
            className="text-ameciclo"
            to="/dados/contagens/$slug"
            params={{ slug: String(row.original.id) }}
            key={row.original.id}
          >
            {row.original.name}
          </Link>
        ),
        meta: { Filter: ColumnFilter },
      },
      {
        header: "Data",
        accessorKey: "date",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          if (!value) return <span>-</span>;
          try {
            return <span>{IntlDateStr(value)}</span>;
          } catch {
            return <span>{value}</span>;
          }
        },
        meta: { Filter: ColumnFilter },
      },
      {
        header: "Total de Ciclistas",
        accessorKey: "total_cyclists",
        filterFn: "numberRange" as any,
        meta: { Filter: NumberRangeColumnFilter },
      },
      {
        header: "COMPARE",
        accessorKey: "compare",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            className="text-ameciclo hover:underline font-medium"
            to="/dados/contagens/$slug/compare/$compareSlug"
            params={{ slug: String(firstSlug), compareSlug: String(row.original.id) }}
          >
            COMPARE
          </Link>
        ),
      },
    ],
    [firstSlug]
  );

  if (!isMounted) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-gray-600 text-2xl mb-4">Compare com outras contagens</h2>
          <p className="text-gray-500 mb-4">Carregando dados...</p>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-gray-600 text-2xl mb-4">Compare com outras contagens</h2>
          <p className="text-gray-500 mb-4">Nenhuma outra contagem disponível para comparação no momento.</p>
        </div>
      </section>
    );
  }

  return (
    <Table
      title={"Compare com outras contagens"}
      data={data}
      columns={columns}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    />
  );
};
