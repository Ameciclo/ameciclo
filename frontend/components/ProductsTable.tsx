import React from "react";
import { useTable, usePagination, useFilters, useSortBy } from "react-table";
import { matchSorter } from "match-sorter";
import Link from "next/link";
import ColumnFilter from "./ColumnFilter";

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

export const ProductsTable = ({ data }) => {

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
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
        Cell: ({ row }) => (
          row.original.link ? (
              <Link href={row.original.link}  key={row.original.id}>
                <a className="text-base text-ameciclo">{row.original.title}</a>
              </Link>
              ) : (
                <p className="text-base">{row.original.title}</p>
              )
        ),
        Filter: ColumnFilter,
      },
      {
        Header: "Descrição",
        accessor: "description",
        Cell: ({ row }) => (
          <p className="px-1">{row.original.description}</p>
        ),
        Filter: ColumnFilter,
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
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    nextPage,
    previousPage,
    visibleColumns,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 4 },
      filterTypes,

    },
    useFilters,
    useSortBy,
    usePagination
  );

  const pagesButtons = (numPages) => {
    var pages = []
    for (let i = 1; i <= numPages; i++) {
        pages.push(
            <button
                className="bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-1 mb-2"
                type="button"
                style={{ transition: "all .15s ease" }}
                onClick={() => gotoPage(i-1)}
            >
                {i}
            </button>
        )
    }
    return pages
}

  return (
    <div className="shadow overflow-x-auto bg-white border-b border-gray-200 sm:rounded-lg">
      <table
        {...getTableProps()}
        className="table-auto shadow min-w-full divide-y divide-gray-200"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className="bg-gray-100 rounded-lg text-sm font-medium text-gray-700 text-left"
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className="px-6 py-3 border-gray-200 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider"
                >
                  <div
                    {...column.getSortByToggleProps({ title: "Ordenar" })}
                    className="flex items-center"
                  >
                    {column.render("Header")}
                    <span className="inline-block">
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽️"
                          : " 🔼"
                        : ""}
                    </span>
                  </div>
                  {column.canFilter ? column.render("Filter") : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="bg-white divide-y divide-gray-200 text-sm font-normal text-gray-700"
        >
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className="hover:bg-gray-100 border-b border-gray-200 py-10"
              >
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-700 max-w-sm"
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

      <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
        <div className="inline-flex mt-2 xs:mt-0">
          <button
            className="bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2 mx-2"
            type="button"
            style={{ transition: "all .15s ease" }}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Anterior
          </button>
          {pageOptions.length > 2 && (pagesButtons(pageOptions.length))}
          <button
            className="bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mb-2 mx-1"
            type="button"
            style={{ transition: "all .15s ease" }}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};