"use client";
import React from "react";
import { matchSorter } from "match-sorter";
import { Link } from "@remix-run/react";
import { ColumnFilter, NumberRangeColumnFilter } from "~/components/Commom/Table/TableFilters";
import Table from "~/components/Commom/Table/Table";
import { IntlDateStr } from "~/services/utils";

function fuzzyTextFilterFn(rows: any[], id: string, filterValue: string) {
  return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val: any) => !val;

export const CountingComparisionTable = ({ data, firstSlug }: { data: any[], firstSlug: string }) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows: any[], id: string, filterValue: string) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
      between: (rows: any[], id: string, filterValue: [number, number]) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          if (rowValue === undefined) return true;
          if (filterValue[0] && rowValue < filterValue[0]) return false;
          if (filterValue[1] && rowValue > filterValue[1]) return false;
          return true;
        });
      },
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: { row: any }) => (
          <Link
            className="text-ameciclo"
            to={`/dados/contagens/${row.original.slug}`}
            key={row.original.id}
          >
            {row.original.name}
          </Link>
        ),
        Filter: ColumnFilter,
      },
      {
        Header: "Data",
        accessor: "date",
        Cell: ({ value }: { value: string }) => (
          <span>{IntlDateStr(value)}</span>
        ),
        Filter: ColumnFilter,
      },
      {
        Header: "Total de Ciclistas",
        accessor: "total_cyclists",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "COMPARE",
        Cell: ({ row }: { row: any }) => (
          <span>
            <Link
              className="text-ameciclo"
              to={`/dados/contagens/${firstSlug}/${row.original.slug}`}
            >
              COMPARE
            </Link>
          </span>
        ),
        disableFilters: true,
      },
    ],
    [firstSlug]
  );

  return (
    <Table
      title={"Compare com outras contagens"}
      data={data}
      columns={columns}
      filterTypes={filterTypes}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    />
  );
};
