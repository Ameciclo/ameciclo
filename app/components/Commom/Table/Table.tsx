import React, { useEffect, useState } from "react";
import { matchSorter } from "match-sorter";

import {
    useTable,
    usePagination,
    useFilters,
    useSortBy,
} from "react-table";

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;

const Table = ({ title, data, columns }: any) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const isSmallScreen = window.innerWidth < 768
        setIsSmallScreen(isSmallScreen);
        isSmallScreen ? setPageSize(5) : setPageSize(10)

    }, []);

    const filterTypes = React.useMemo(
        () => ({
            fuzzyText: fuzzyTextFilterFn,
            text: (rows: any, id: any, filterValue: any) => {
                return rows.filter((row: any) => {
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex },
    }: any = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 5 },
            filterTypes,
        },
        useFilters,
        useSortBy,
        usePagination
    );

    function TableHead({ headerGroups, isSmallScreen = false }: any) {
        return (
            <thead>
                {headerGroups.map((headerGroup: any) => (
                    <tr
                        {...headerGroup.getHeaderGroupProps()}
                        className="bg-gray-100 rounded-lg text-sm font-medium text-gray-700 text-left"
                    >
                        {headerGroup.headers.map((column: any, index: number) =>
                            isSmallScreen && index !== 0 ? null : (
                                <th
                                    {...column.getHeaderProps()}
                                    className="px-6 py-3 border-gray-200 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider"
                                >
                                    <div
                                        {...column.getSortByToggleProps({ title: "Ordenar" })}
                                        className="flex items-center"
                                    >
                                        <span className="inline-block">
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? "🔻 "
                                                    : "🔺 "
                                                : "♦️ "}
                                        </span>
                                        {column.render("Header")}
                                    </div>
                                    {isSmallScreen && index !== 0
                                        ? null
                                        : column.canFilter
                                            ? column.render("Filter")
                                            : null}
                                </th>
                            )
                        )}
                    </tr>
                ))}
            </thead>
        );
    }

    function SingleColumnRow({ cells }: any) {
        return (
            <tr>
                {cells.map((cell: any) => {
                    return (
                        <div>
                            <strong>{cell.column.Header}:</strong> {cell.render("Cell")}
                        </div>
                    );
                })}
            </tr>
        );
    }

    function TableBody({
        getTableBodyProps,
        page,
        prepareRow,
        isSmallScreen = false,
    }: any) {
        return (
            <tbody
                {...getTableBodyProps()}
                className="bg-white divide-y divide-gray-200 text-sm font-normal text-gray-700"
            >
                {page.map((row: any, i: any) => {
                    prepareRow(row);
                    return isSmallScreen ? (
                        <div className="hover:bg-gray-100 border-b border-gray-200 p-3">
                            <SingleColumnRow cells={row.cells} />
                        </div>
                    ) : (
                        <tr
                            {...row.getRowProps()}
                            className="hover:bg-gray-100 border-b border-gray-200 py-10"
                        >
                            {row.cells.map((cell: any) => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                        className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-700 truncate max-w-sm"
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        );
    }

    function TableFooter({
        rows,
        canPreviousPage,
        canNextPage,
        previousPage,
        pageOptions,
        nextPage,
        pageIndex,
        gotoPage,
        data,
    }: any) {
        const [pageNumberInput, setPageNumberInput] = useState("");

        const handlePageNumberChange = (event: any) => {
            setPageNumberInput(event.target.value);
        };

        const handleKeyPress = (event: any) => {
            if (event.key === "Enter") {
                handleGoToPage();
            }
        };

        const handleGoToPage = () => {
            const inputPage = parseInt(pageNumberInput, 10);
            if (
                !isNaN(inputPage) &&
                inputPage >= 1 &&
                inputPage <= pageOptions.length
            ) {
                gotoPage(inputPage - 1);
                setPageNumberInput("");
            }
        };

        const shouldUseInput = pageOptions.length > 10;
        const pagesButtons = (numPages: any) => {
            var pages: any[] = [];
            for (let i = 1; i <= numPages; i++) {
                if (i - 1 != pageIndex) {
                    pages.push(
                        <button
                            className="bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-1 mb-2"
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
                            className="bg-red-500 border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-1 mb-2"
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
            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <p>Mostrando {rows.length} de {data.length} linhas ao todo.</p>
                <p>Página {pageIndex + 1} de {pageOptions.length}.</p>
                <div className="inline-flex mt-2 xs:mt-0">
                    {canPreviousPage && (
                        <button
                            className="hidden sm:block bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2 mx-2"
                            type="button"
                            style={{ transition: "all .15s ease" }}
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                        >
                            Anterior
                        </button>
                    )}

                    <div className="p-1">
                        {shouldUseInput ? (
                            <>
                                <input
                                    type="text"
                                    className="border-gray-300 border p-1"
                                    value={pageNumberInput}
                                    onChange={handlePageNumberChange}
                                    onKeyUp={handleKeyPress}
                                    style={{ width: "40px", textAlign: "center" }}
                                />
                                <button
                                    className="bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-2 py-1 rounded outline-none focus:outline-none mb-2 mx-1"
                                    type="button"
                                    style={{ transition: "all .15s ease" }}
                                    onClick={handleGoToPage}
                                >
                                    Ir
                                </button>
                            </>
                        ) : (
                            pageOptions.length > 0 && pagesButtons(pageOptions.length)
                        )}
                    </div>

                    {canNextPage && (
                        <button
                            className="hidden sm:block bg-ameciclo border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mb-2 mx-1"
                            type="button"
                            style={{ transition: "all .15s ease" }}
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                        >
                            Próxima
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
            <h2 className="text-gray-600 text-3xl">{title}</h2>
            <div className="shadow overflow-x-auto bg-white border-b border-gray-200 sm:rounded-lg">
                <table
                    {...getTableProps()}
                    className="table-auto shadow min-w-full divide-y divide-gray-200"
                >
                    <TableHead headerGroups={headerGroups} isSmallScreen={isSmallScreen} />
                    <TableBody
                        getTableBodyProps={getTableBodyProps}
                        page={page}
                        prepareRow={prepareRow}
                        isSmallScreen={isSmallScreen}
                    />
                </table>
                <TableFooter
                    rows={rows}
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                    previousPage={previousPage}
                    pageOptions={pageOptions}
                    nextPage={nextPage}
                    pageIndex={pageIndex}
                    gotoPage={gotoPage}
                    data={data}
                />
            </div>
        </section>
    );
};

export default Table;