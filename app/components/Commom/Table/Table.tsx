import React, { useEffect, useState } from "react";
import { matchSorter } from "match-sorter";

import { useTable, usePagination, useFilters, useSortBy, useExpanded } from "react-table";

const SMALL_SCREEN_WIDTH = 768;

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;

export function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }: any) {
    const [min, max] = filterValue;

    return (
        <div className="flex space-x-2">
            <input
                value={min || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    setFilter((old = []) => [val ? Number(val) : undefined, old[1]]);
                }}
                placeholder="Mínimo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                value={max || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    setFilter((old = []) => [old[0], val ? Number(val) : undefined]);
                }}
                placeholder="Máximo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}

export function numberRangeFilterFn(rows: any, id: any, filterValue: any) {
    const [min, max] = filterValue;
    return rows.filter((row: any) => {
        const rowValue = row.values[id];
        return (
            (min === undefined || rowValue >= min) &&
            (max === undefined || rowValue <= max)
        );
    });
}

numberRangeFilterFn.autoRemove = (val: any) => !val[0] && !val[1];

function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter, Header } }: any) {
    const count = preFilteredRows.length;

    return (
        <input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
            placeholder={`Buscar ${typeof Header === 'string' ? Header : ''}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    );
}

const Table = ({ title, data, columns, allColumns, showFilters, setShowFilters, subtitle, filterType, setFilterType, pageLoa, classifyAction }: any) => {
    const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < SMALL_SCREEN_WIDTH : false);
    const [shouldBlink, setShouldBlink] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    const safeData = React.useMemo(() => {
        try {
            if (!Array.isArray(data)) {
                console.warn('Table data is not an array:', data);
                return [];
            }
            return data.filter(item => item && typeof item === 'object');
        } catch (error) {
            console.error('Error processing table data:', error);
            setHasError(true);
            return [];
        }
    }, [data]);
    
    const safeColumns = React.useMemo(() => {
        try {
            if (!Array.isArray(columns)) {
                console.warn('Table columns is not an array:', columns);
                return [];
            }
            return columns.filter(col => col && col.accessor);
        } catch (error) {
            console.error('Error processing table columns:', error);
            setHasError(true);
            return [];
        }
    }, [columns]);
    
    if (hasError) {
        return (
            <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-red-50">
                <div className="text-center">
                    <h2 className="text-red-800 text-2xl mb-4">Erro ao carregar tabela</h2>
                    <p className="text-red-600 mb-4">Houve um problema ao processar os dados da tabela.</p>
                    <button 
                        onClick={() => {
                            setHasError(false);
                            window.location.reload();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </section>
        );
    }
    
    if (safeData.length === 0) {
        return (
            <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-gray-50">
                <div className="text-center">
                    <h2 className="text-gray-600 text-2xl mb-4">{title}</h2>
                    <p className="text-gray-500 mb-4">Nenhum dado disponível no momento.</p>
                </div>
            </section>
        );
    }

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
            numberRange: numberRangeFilterFn,
        }),
        []
    );

    const defaultColumn = React.useMemo(
        () => ({
            Filter: DefaultColumnFilter,
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
        state: { pageIndex, expanded },
    }: any = useTable(
        {
            columns: safeColumns,
            data: safeData,
            initialState: { pageIndex: 0, pageSize: 5 },
            filterTypes,
            defaultColumn,
        },
        useFilters,
        useSortBy,
        useExpanded,
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

    function TableHead({ headerGroups, isSmallScreen = false, showFilters, setShowFilters, rows }: any) {
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
                                        {column.Header === 'Ação' ? `Ação (${new Set(rows.map((row: any) => row.original.cd_nm_acao)).size})` : column.Header === 'Sub-ação' ? `Sub-ação (${rows.length})` : column.Header === 'Total Empenhado' ? `Total Empenhado (${(() => { const total = rows.reduce((sum: number, row: any) => sum + row.original.vlrdotatualizada, 0); return total >= 1000000 ? (total >= 1000000000 ? `R$ ${(total / 1000000000).toFixed(1).replace('.0', '')} Bi` : `R$ ${(total / 1000000).toFixed(1).replace('.0', '')} Mi`) : `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`; })()})` : column.Header === 'Total Pago' ? `Total Pago (${(() => { const total = rows.reduce((sum: number, row: any) => sum + row.original.vlrtotalpago, 0); return total >= 1000000 ? (total >= 1000000000 ? `R$ ${(total / 1000000000).toFixed(1).replace('.0', '')} Bi` : `R$ ${(total / 1000000).toFixed(1).replace('.0', '')} Mi`) : `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`; })()})` : column.render("Header")}
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
                        <React.Fragment key={i}>
                            <tr
                                {...row.getRowProps()}
                                className={`border-b border-gray-200 cursor-pointer ${row.original.type === 'good' ? 'bg-blue-600 text-white hover:bg-blue-200' : row.original.type === 'bad' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'hover:bg-gray-100'}`}
                                onClick={() => row.toggleRowExpanded()}
                            >
                                <td className="px-6 py-4">
                                    <div className={`hover:bg-gray-100 border-b border-gray-200 p-3 ${row.original.type === 'good' || row.original.type === 'bad' ? 'text-white' : ''}`}>
                                        <SingleColumnRow cells={row.cells || []} />
                                    </div>
                                </td>
                            </tr>
                            {row.isExpanded ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <div className="p-4 bg-[#008080] text-white transition-all duration-300 ease-in-out overflow-hidden">
                                            <div className="mb-2">
                                                <strong>Tipo de Ação:</strong> {row.original.type === 'good' ? 'Boa Ação' : row.original.type === 'bad' ? 'Má Ação' : 'Ação Neutra'}
                                            </div>
                                            {allColumns.map((col: any) => {
                                                const value = row.original[col.accessor];
                                                const formattedValue = col.Cell ? col.Cell({ value }) : String(value);
                                                return (
                                                    <div key={col.accessor} className="mb-2">
                                                        <strong>{col.Header}:</strong> {formattedValue}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </React.Fragment>
                    ) : (
                        <React.Fragment key={i}>
                            <tr
                                {...row.getRowProps()}
                                className={`border-b border-gray-200 cursor-pointer ${row.original.type === 'good' ? 'bg-blue-600 text-white hover:bg-blue-700' : row.original.type === 'bad' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'hover:bg-gray-100'}`}
                                onClick={() => row.toggleRowExpanded()}
                            >
                                {row.cells.map((cell: any, cellIndex: number) => {
                                    return (
                                        <td
                                            key={cell.column.id || cellIndex}
                                            {...cell.getCellProps()}
                                            className={`px-6 py-4 text-sm leading-5 break-words ${row.original.type === 'good' || row.original.type === 'bad' ? 'text-white' : 'text-gray-700'}`}
                                            style={{ width: '20%' }}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    );
                                })}
                            </tr>
                            {row.isExpanded ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <div className="p-4 bg-[#008080] text-white transition-all duration-300 ease-in-out overflow-hidden">
                                            <div className="mb-2">
                                                <strong>Tipo de Ação:</strong> {row.original.type === 'good' ? 'Boa Ação' : row.original.type === 'bad' ? 'Má Ação' : 'Ação Neutra'}
                                            </div>
                                            {allColumns.map((col: any) => {
                                                const value = row.original[col.accessor];
                                                const formattedValue = col.Cell ? col.Cell({ value }) : String(value);
                                                return (
                                                    <div key={col.accessor} className="mb-2">
                                                        <strong>{col.Header}:</strong> {formattedValue}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </React.Fragment>
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
        pageOptions = [],
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
                            {rows.length} resultados • Página {pageIndex + 1} de {pageOptions?.length || 1}
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                className={`px-2 py-1 text-xs rounded transition-colors ${canPreviousPage
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                onClick={() => canPreviousPage && previousPage()}
                                disabled={!canPreviousPage}
                            >
                                ← Anterior
                            </button>

                            <button
                                className={`px-2 py-1 text-xs rounded transition-colors ${canNextPage
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
            <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                    <h2 className="text-gray-600 text-3xl mb-2">{title}</h2>

                    {subtitle && (<p>{subtitle}</p>)}
                    {pageLoa && (
                        <>
                            <p className="text-gray-500 text-sm mb-3 md:hidden">
                                Acesse a versão web para mais recursos de filtros e melhor visualização
                            </p>
                            <p className="text-gray-500 text-sm mb-3 hidden md:block">
                                Explore, filtre e ordene os dados da Lei Orçamentária Anual de 2025.
                            </p>
                            <p className="text-gray-500 text-sm mb-3 hidden md:block">
                                ** Clique na coluna para ordenar <br /> ** Use os filtros avançados <br /> ** Clique na ação para ver mais detalhes.
                            </p>
                        </>
                    )}


                    {/* Tags de filtro */}
                    {setFilterType && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors text-black ${filterType === 'all'
                                    ? 'bg-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                Todas as Ações
                            </button>
                            <button
                                onClick={() => setFilterType('good')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === 'good'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                            >
                                Boas Ações
                            </button>
                            <button
                                onClick={() => setFilterType('bad')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === 'bad'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    }`}
                            >
                                Más Ações
                            </button>
                        </div>
                    )}
                </div>
                {setShowFilters && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters
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
                    {(headerGroups[0]?.headers || []).filter(column => {
                        try {
                            const hasFilter = column.filterValue && 
                                (Array.isArray(column.filterValue) ? column.filterValue.some(val => val !== undefined && val !== '') : column.filterValue !== '');
                            return hasFilter;
                        } catch (error) {
                            console.warn('Error filtering column:', column, error);
                            return false;
                        }
                    }).map((column: any) => {
                        const headerText = typeof column.Header === 'function' ? 'Extensão executada' : column.Header;
                        let displayValue = '';

                        try {
                            if (column.id === 'total_cyclists') {
                                const [minVal, maxVal] = Array.isArray(column.filterValue) ? column.filterValue : [null, null];
                                if (minVal && maxVal) {
                                    displayValue = `de ${minVal} a ${maxVal}`;
                                } else if (minVal) {
                                    displayValue = `a partir de ${minVal}`;
                                } else if (maxVal) {
                                    displayValue = `até ${maxVal}`;
                                }
                            } else if (column.filter === 'numberRange') {
                                const [minVal, maxVal] = Array.isArray(column.filterValue) ? column.filterValue : [null, null];
                                if (minVal && maxVal) {
                                    displayValue = `de R$ ${minVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a R$ ${maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                } else if (minVal) {
                                    displayValue = `a partir de R$ ${minVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                } else if (maxVal) {
                                    displayValue = `até R$ ${maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                }
                            } else if (headerText.includes('Extensão')) {
                                displayValue = `~${column.filterValue} km`;
                            } else {
                                displayValue = String(column.filterValue);
                            }
                        } catch (error) {
                            displayValue = 'Filtro ativo';
                        }

                        if (!displayValue) return null;

                        return (
                            <div key={column.id} className="inline-flex items-center bg-[#008080] text-white px-3 py-1 rounded-full text-sm">
                                <span className="mr-2">{headerText}: {displayValue}</span>
                                <button
                                    onClick={() => {
                                        try {
                                            column.setFilter(column.filter === 'numberRange' ? [undefined, undefined] : undefined);
                                        } catch (error) {
                                            console.warn('Erro ao remover filtro:', error);
                                        }
                                    }}
                                    className="text-white hover:text-gray-200 font-bold ml-1"
                                    title="Remover filtro"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="shadow overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
                <table
                    {...getTableProps()}
                    className="table-auto shadow min-w-full divide-y divide-gray-200"
                >
                    {isInitialized && <TableHead headerGroups={headerGroups} isSmallScreen={isSmallScreen} showFilters={showFilters} setShowFilters={setShowFilters} rows={rows} />}
                    {showFilters && (
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <td colSpan={headerGroups[0]?.headers?.length || 5} className="px-0 py-0">
                                    <div className={`transition-all duration-500 ease-out overflow-hidden ${showFilters ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="flex flex-wrap px-6 py-3 gap-4">
                                            {headerGroups[0]?.headers?.map((column: any, index: number) => (
                                                <div key={column.id || index} className="w-full sm:flex-1">
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