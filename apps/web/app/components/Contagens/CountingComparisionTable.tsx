"use client";
import React from "react";
import { Link } from "@tanstack/react-router";
import { tableColumnHelper } from "~/components/Commom/Table/features";
import { ColumnFilter, NumberRangeColumnFilter, between, containsText } from "~/components/Commom/Table/TableFilters";
import Table from "~/components/Commom/Table/Table";
import type { CountRow } from "@ameciclo/db/derive";
import { IntlDateStr, IntlNumber } from "~/services/utils";

// The other counts to compare with: no variant and no change against the previous count.
type ComparisonRow = Omit<CountRow, "variant" | "change">;

const columnHelper = tableColumnHelper<ComparisonRow>();

export const CountingComparisionTable = ({ data, firstSlug }: { data: ComparisonRow[], firstSlug: string }) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = React.useMemo(
    () => columnHelper.columns([
      columnHelper.accessor("name", {
        header: "Nome",
        cell: ({ row }) => (
          <Link
            className="text-ameciclo"
            to="/dados/contagens/$slug"
            params={{ slug: row.original.slug }}
            key={row.original.countId}
          >
            {row.original.name}
          </Link>
        ),
        meta: { Filter: ColumnFilter },
        filterFn: containsText,
      }),
      columnHelper.accessor("date", {
        header: "Data",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return <span>-</span>;
          try {
            return <span>{IntlDateStr(value)}</span>;
          } catch {
            return <span>{value}</span>;
          }
        },
        meta: { Filter: ColumnFilter },
      }),
      columnHelper.accessor("total_cyclists", {
        header: "Total de Ciclistas",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            {IntlNumber(row.original.total_cyclists)}
            {row.original.note && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {row.original.note}
              </span>
            )}
          </span>
        ),
        meta: { Filter: NumberRangeColumnFilter },
        filterFn: between,
      }),
      columnHelper.display({
        header: "COMPARE",
        id: "compare",
        cell: ({ row }) => (
          <Link
            className="text-ameciclo hover:underline font-medium"
            to="/dados/contagens/$slug/compare/$compareSlug"
            params={{ slug: firstSlug, compareSlug: row.original.slug }}
          >
            COMPARE
          </Link>
        ),
      }),
    ]),
    [firstSlug]
  );

  if (!isMounted) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-gray-600 text-2xl mb-4">Compare com outras contagens</h2>
          <p className="text-gray-500 mb-4">Carregando dados...</p>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
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
