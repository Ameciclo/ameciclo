import React from "react";
import "regenerator-runtime/runtime";
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useAsyncDebounce,
} from "react-table";
import { matchSorter } from "match-sorter";
import Link from "next/link";
//import ColumnFilter from "./ColumnFilter";
import { GlobalFilter } from "./GlobalFilter";

/*
function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}*/

// Let the table remove the filter if the string is empty
//fuzzyTextFilterFn.autoRemove = (val) => !val;

export const ProductsTable = ({ data }) => {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      //fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Produto",
        accessor: "product",
        Cell: ({ row }) =>
          row.original.link ? (
            <Link href={row.original.link} key={row.original.id}>
              <span className="text-base text-ameciclo">{row.original.title}</span>
            </Link>
          ) : (
            <p className="text-base">{row.original.title}</p>
          ),
      },
      {
        Header: "Descrição",
        accessor: "description",
        Cell: ({ row }) => <p className="px-1">{row.original.description}</p>,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    nextPage,
    previousPage,
    visibleColumns,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 4 },
      filterTypes,
    },
    useFilters,
    useGlobalFilter, // useGlobalFilter!

    useSortBy,
    usePagination
  );

  const pagesButtons = (numPages) => {
    var pages = [];
    for (let i = 1; i <= numPages; i++) {
      if (i - 1 != pageIndex) {
        pages.push(
          <button
            className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase border-2 border-white rounded shadow outline-none bg-ameciclo hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-1"
            type="button"
            style={{ transition: "all .15s ease" }}
            onClick={() => gotoPage(i - 1)}
          >
            {i}
          </button>
        );
      } else {
        pages.push(
          <button
            className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-red-500 border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-1"
            type="button"
            style={{ transition: "all .15s ease" }}
            onClick={() => gotoPage(i - 1)}
          >
            {i}
          </button>
        );
      }
    }
    return pages;
  };

  return (
    <div className="overflow-x-auto bg-white border-b border-gray-200 shadow sm:rounded-lg">
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200 shadow table-auto"
      >
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr
              key={i}
              {...headerGroup.getHeaderGroupProps()}
              className="text-sm font-medium text-left text-gray-700 rounded-lg bg-ameciclo"
            >
              {headerGroup.headers.map((column, j) => (
                <th
                  key={j}
                  {...column.getHeaderProps()}
                  className="px-6 py-3 text-sm font-medium leading-4 tracking-wider text-left text-white uppercase border-gray-200"
                >
                  <div
                    {...column.getSortByToggleProps({ title: "Ordenar" })}
                    className="flex items-center"
                  >
                    {column.render("Header")}
                    <span className="inline-block">
                      {column.isSorted
                        ? column.isSortedDesc
                          ? "  🔻"
                          : "  🔺"
                        : ""}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="text-sm font-normal text-gray-700 bg-white divide-y divide-gray-200"
        >
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                key={i}
                {...row.getRowProps()}
                className="py-10 border-b border-gray-200 hover:bg-gray-100"
              >
                {row.cells.map((cell, j) => {
                  return (
                    <td
                      key={j}
                      {...cell.getCellProps()}
                      className="max-w-sm px-6 py-4 text-sm leading-5 text-gray-700 whitespace-no-wrap"
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-col items-center px-5 py-5 bg-white border-t xs:flex-row xs:justify-between">
        <div className="inline-flex mt-2 xs:mt-0">
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
          {canPreviousPage ? (
            <button
              className="px-4 py-2 mx-2 mb-2 text-xs font-bold text-white uppercase border-2 border-white rounded shadow outline-none bg-ameciclo hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
              type="button"
              style={{ transition: "all .15s ease" }}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              Anterior
            </button>
          ) : (
            <button
              className="px-4 py-2 mx-2 mb-2 text-xs font-bold text-white uppercase bg-red-500 border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
              type="button"
              style={{ transition: "all .15s ease" }}
              //onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              Anterior
            </button>
          )}

          {pageOptions.length > 0 && pagesButtons(pageOptions.length)}

          {canNextPage ? (
            <button
              className="px-4 py-2 mx-1 mb-2 text-xs font-bold text-white uppercase border-2 border-white rounded shadow outline-none bg-ameciclo hover:bg-white hover:text-ameciclo focus:outline-none"
              type="button"
              style={{ transition: "all .15s ease" }}
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              Próxima
            </button>
          ) : (
            <button
              className="px-4 py-2 mx-1 mb-2 text-xs font-bold text-white uppercase bg-red-500 border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none"
              type="button"
              style={{ transition: "all .15s ease" }}
              //onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              Próxima
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
