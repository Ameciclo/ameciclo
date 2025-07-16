import React, { useEffect, useState } from "react";
import { matchSorter } from "match-sorter";

import {
    useTable,
    usePagination,
    useFilters,
    useSortBy,
} from "react-table";

const SMALL_SCREEN_WIDTH = 768;

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;

const Table = ({ title, data, columns, showFilters, setShowFilters }: any) => {
    const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < SMALL_SCREEN_WIDTH : false);
    const [shouldBlink, setShouldBlink] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const safeData = data || [];
    const safeColumns = columns || [];

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
            columns: safeColumns,
            data: safeData,
            initialState: { pageIndex: 0, pageSize: 5 },
            filterTypes,
        },
        useFilters,
        useSortBy,
        usePagination
    );

    useEffect(() => {
        const checkScreenSize = () => {
            const isSmall = window.innerWidth < SMALL_SCREEN_WIDTH;
            setIsSmallScreen(isSmall);
            setPageSize(isSmall ? 5 : 10);
            if (!isInitialized) {
                setIsInitialized(true);
            }
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [setPageSize, isInitialized]);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const timer = setTimeout(() => {
                        setShouldBlink(true);
                        setTimeout(() => setShouldBlink(false), 4000);
                    }, 2000);
                    observer.disconnect();
                    return () => clearTimeout(timer);
                }
            },
            { threshold: 0.5 }
        );
        
        const tableSection = document.querySelector('section.container');
        if (tableSection) observer.observe(tableSection);
        
        return () => observer.disconnect();
    }, []);

    function TableHead({ headerGroups, isSmallScreen = false, showFilters, setShowFilters }: any) {
        return (
            <thead>
                {headerGroups.map((headerGroup: any, groupIndex: number) => (
                    <tr
                        key={groupIndex}
                        {...headerGroup.getHeaderGroupProps()}
                        className="bg-gray-100 rounded-lg text-sm font-medium text-gray-700 text-left relative"
                    >
                        {headerGroup.headers.map((column: any, index: number) =>
                            isSmallScreen && index !== 0 ? null : (
                                <th
                                    key={column.id || index}
                                    {...column.getHeaderProps()}
                                    className="px-6 py-3 border-gray-200 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider"
                                >
                                    <div
                                        {...column.getSortByToggleProps({ title: "Ordenar" })}
                                        className="flex items-center cursor-pointer"
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
            <div>
                {cells.map((cell: any, index: number) => {
                    return (
                        <div key={index} className="mb-2">
                            <strong>{typeof cell.column.Header === 'function' ? 'Extensão executada' : cell.column.Header}:</strong> {cell.render("Cell")}
                        </div>
                    );
                })}
            </div>
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
                {page.map((row: any, i: number) => {
                    prepareRow(row);
                    return isSmallScreen ? (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="hover:bg-gray-100 border-b border-gray-200 p-3">
                                    <SingleColumnRow cells={row.cells} />
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <tr
                            key={i}
                            {...row.getRowProps()}
                            className="hover:bg-gray-100 border-b border-gray-200"
                        >
                            {row.cells.map((cell: any, cellIndex: number) => {
                                return (
                                    <td
                                        key={cell.column.id || cellIndex}
                                        {...cell.getCellProps()}
                                        className="px-6 py-4 text-sm leading-5 text-gray-700 break-words"
                                        style={{ width: '20%' }}
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
                if (i - 1 !== pageIndex) {
                    pages.push(
                        <button
                            key={i}
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
                            key={i}
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
            <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-center sm:justify-end">
                    <div className="flex items-center space-x-4">
                        <div className="text-xs text-gray-500">
                            {rows.length} resultados • Página {pageIndex + 1} de {pageOptions.length}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <button
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                    canPreviousPage 
                                        ? 'text-gray-600 hover:bg-gray-100' 
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() => canPreviousPage && previousPage()}
                                disabled={!canPreviousPage}
                            >
                                ← Anterior
                            </button>
                            
                            <button
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                    canNextPage 
                                        ? 'text-gray-600 hover:bg-gray-100' 
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() => canNextPage && nextPage()}
                                disabled={!canNextPage}
                            >
                                Próxima →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
            <style jsx>{`
                @keyframes blinkAmeciclo {
                    0%, 100% { 
                        background-color: white;
                        color: #6b7280;
                        border-color: #d1d5db;
                    }
                    50% { 
                        background-color: #008080;
                        color: white;
                        border-color: #008080;
                    }
                }
            `}</style>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-gray-600 text-3xl">{title}</h2>
                    <p className="text-gray-500 text-sm mt-1 md:hidden">
                        Acesse a versão web para mais recursos de filtros
                    </p>
                </div>
                {setShowFilters && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                            showFilters 
                                ? 'bg-[#008080] text-white border-[#008080]' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                            animation: shouldBlink ? 'blinkAmeciclo 2s ease-in-out 2' : 'none'
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="hidden md:inline">Filtros</span>
                    </button>
                )}
            </div>
            
            {/* Filtros ativos */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {headerGroups[0]?.headers?.map((column: any) => {
                        if (column.filterValue) {
                            const headerText = typeof column.Header === 'function' ? 'Extensão executada' : column.Header;
                            const isExtensionColumn = headerText.includes('Extensão');
                            const displayValue = isExtensionColumn ? `~${column.filterValue} km` : column.filterValue;
                            return (
                                <div key={column.id} className="inline-flex items-center bg-[#008080] text-white px-3 py-1 rounded-full text-sm">
                                    <span className="mr-2">{headerText}: {displayValue}</span>
                                    <button
                                        onClick={() => column.setFilter(undefined)}
                                        className="text-white hover:text-gray-200 font-bold"
                                        title="Remover filtro"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
            <div className="shadow overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
                <table
                    {...getTableProps()}
                    className="table-auto shadow min-w-full divide-y divide-gray-200"
                >
                    {isInitialized && <TableHead headerGroups={headerGroups} isSmallScreen={isSmallScreen} showFilters={showFilters} setShowFilters={setShowFilters} />}
                    {showFilters && (
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <td colSpan={headerGroups[0]?.headers?.length || 5} className="px-0 py-0">
                                    <div className={`transition-all duration-500 ease-out overflow-hidden ${
                                        showFilters ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="flex px-6 py-3 gap-4">
                                            {headerGroups[0]?.headers?.map((column: any, index: number) => (
                                                <div key={column.id || index} className="flex-1">
                                                    {column.canFilter && (!isSmallScreen || index === 0) && column.render('Filter')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </thead>
                    )}

                    {isInitialized && <TableBody
                        getTableBodyProps={getTableBodyProps}
                        page={page}
                        prepareRow={prepareRow}
                        isSmallScreen={isSmallScreen}
                    />}
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