import React, { useEffect, useMemo, useState } from "react";
import {
    ColumnDef,
    FilterFn,
    Row,
    Table as TanstackTable,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { matchSorter } from "match-sorter";
import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

const SMALL_SCREEN_WIDTH = 768;

const fuzzyTextFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const value = String(row.getValue(columnId) ?? "");
    return matchSorter([value], filterValue).length > 0;
};

const numberRangeFilter: FilterFn<any> = (row, columnId, filterValue: [number | undefined, number | undefined]) => {
    const [min, max] = filterValue ?? [];
    const rowValue = Number(row.getValue(columnId));
    if (Number.isNaN(rowValue)) return true;
    if (min !== undefined && rowValue < min) return false;
    if (max !== undefined && rowValue > max) return false;
    return true;
};

const startsWithFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const rowValue = row.getValue(columnId);
    if (rowValue === undefined) return true;
    return String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
};

const filterFns = {
    fuzzyText: fuzzyTextFilter,
    numberRange: numberRangeFilter,
    text: startsWithFilter,
};

export function NumberRangeColumnFilter({ column }: { column: any }) {
    const filterValue = (column.getFilterValue() as [number | undefined, number | undefined]) ?? [];
    const [min, max] = filterValue;

    return (
        <div className="flex space-x-2">
            <input
                value={min ?? ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: [number | undefined, number | undefined] | undefined) => [
                        val ? Number(val) : undefined,
                        old?.[1],
                    ]);
                }}
                placeholder="Mínimo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                value={max ?? ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: [number | undefined, number | undefined] | undefined) => [
                        old?.[0],
                        val ? Number(val) : undefined,
                    ]);
                }}
                placeholder="Máximo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}

function DefaultColumnFilter({ column }: { column: any }) {
    const filterValue = column.getFilterValue() as string | undefined;
    const header = column.columnDef.header;
    const headerText = typeof header === "string" ? header : "";
    return (
        <input
            value={filterValue ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            placeholder={`Buscar ${headerText}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    );
}

type ColumnMeta = {
    Filter?: React.ComponentType<{ column: any; table?: TanstackTable<any> }>;
};

type TableProps = {
    title?: string;
    subtitle?: string;
    data: any[];
    columns: ColumnDef<any, any>[];
    allColumns?: ColumnDef<any, any>[];
    showFilters?: boolean;
    setShowFilters?: (v: boolean) => void;
    filterType?: "all" | "good" | "bad";
    setFilterType?: (v: "all" | "good" | "bad") => void;
    pageLoa?: boolean;
    classifyAction?: (row: any) => string | undefined;
    customHeader?: React.ReactNode;
};

const Table = ({
    title,
    subtitle,
    data,
    columns,
    allColumns,
    showFilters,
    setShowFilters,
    filterType,
    setFilterType,
    pageLoa,
    customHeader,
}: TableProps) => {
    const [isSmallScreen, setIsSmallScreen] = useState(
        typeof window !== "undefined" ? window.innerWidth < SMALL_SCREEN_WIDTH : false
    );
    const [shouldBlink, setShouldBlink] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasError, setHasError] = useState(false);
    const firstFilterRef = React.useRef<HTMLInputElement>(null);

    const safeData = useMemo(() => {
        try {
            if (!Array.isArray(data)) {
                console.warn("Table data is not an array:", data);
                return [];
            }
            return data.filter((item) => item && typeof item === "object");
        } catch (error) {
            console.error("Error processing table data:", error);
            setHasError(true);
            return [];
        }
    }, [data]);

    const safeColumns = useMemo<ColumnDef<any, any>[]>(() => {
        try {
            if (!Array.isArray(columns)) {
                console.warn("Table columns is not an array:", columns);
                return [];
            }
            return columns;
        } catch (error) {
            console.error("Error processing table columns:", error);
            setHasError(true);
            return [];
        }
    }, [columns]);

    const table = useReactTable({
        data: safeData,
        columns: safeColumns,
        filterFns,
        defaultColumn: {
            meta: { Filter: DefaultColumnFilter } as ColumnMeta,
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 5 },
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    useEffect(() => {
        if (showFilters && firstFilterRef.current) {
            setTimeout(() => firstFilterRef.current?.focus(), 100);
        }
    }, [showFilters]);

    useEffect(() => {
        const checkScreenSize = () => {
            const isSmall = window.innerWidth < SMALL_SCREEN_WIDTH;
            setIsSmallScreen(isSmall);
            table.setPageSize(isSmall ? 5 : 10);
            if (!isInitialized) setIsInitialized(true);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, [table, isInitialized]);

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

        const tableSection = document.querySelector("section.container");
        if (tableSection) observer.observe(tableSection);
        return () => observer.disconnect();
    }, []);

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
            <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
                <div className="mb-4">
                    <h2 className="text-gray-600 text-3xl mb-2">{title}</h2>
                </div>
                <div className="shadow overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {[...Array(4)].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(4)].map((__, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    const headerGroups = table.getHeaderGroups();
    const rows = table.getFilteredRowModel().rows;
    const pageRows = table.getRowModel().rows;
    const pageCount = table.getPageCount();
    const pageIndex = table.getState().pagination.pageIndex;

    const activeFilterHeaders = (headerGroups[0]?.headers ?? []).filter((header) => {
        const v = header.column.getFilterValue();
        if (v === undefined || v === "") return false;
        if (Array.isArray(v)) return v.some((val) => val !== undefined && val !== "");
        return true;
    });

    return (
        <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
            {customHeader && <div className="mb-6">{customHeader}</div>}

            <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                    {!customHeader && <h2 className="text-gray-600 text-3xl mb-2">{title}</h2>}

                    {subtitle && <p>{subtitle}</p>}
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

                    {setFilterType && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                onClick={() => setFilterType("all")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors text-black ${
                                    filterType === "all" ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            >
                                Todas as Ações
                            </button>
                            <button
                                onClick={() => setFilterType("good")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    filterType === "good" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                }`}
                            >
                                Boas Ações
                            </button>
                            <button
                                onClick={() => setFilterType("bad")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    filterType === "bad" ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
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
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                            showFilters ? "bg-[#008080] text-white border-[#008080]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                        style={{ animation: shouldBlink ? "blinkAmeciclo 2s ease-in-out 2" : "none" }}
                        aria-label={showFilters ? "Ocultar campos de filtro abaixo das colunas" : "Mostrar campos de filtro abaixo das colunas da tabela"}
                        title={showFilters ? "Ocultar filtros" : "Clique para exibir campos de filtro abaixo de cada coluna"}
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
                    {activeFilterHeaders.map((header) => {
                        const column = header.column;
                        const headerDef = column.columnDef.header;
                        const headerText = typeof headerDef === "function" ? "Extensão executada" : String(headerDef ?? "");
                        const filterValue = column.getFilterValue();
                        let displayValue = "";

                        try {
                            if (column.id === "total_cyclists" || (column.columnDef.filterFn as unknown) === "numberRange") {
                                const [minVal, maxVal] = (Array.isArray(filterValue) ? filterValue : [null, null]) as [number | null, number | null];
                                const isCurrency = (column.columnDef.filterFn as unknown) === "numberRange" && column.id !== "total_cyclists";
                                const fmt = (n: number) =>
                                    isCurrency
                                        ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                        : String(n);
                                if (minVal != null && maxVal != null) displayValue = `de ${fmt(minVal)} a ${fmt(maxVal)}`;
                                else if (minVal != null) displayValue = `a partir de ${fmt(minVal)}`;
                                else if (maxVal != null) displayValue = `até ${fmt(maxVal)}`;
                            } else if (headerText.includes("Extensão")) {
                                displayValue = `~${filterValue} km`;
                            } else {
                                displayValue = String(filterValue);
                            }
                        } catch {
                            displayValue = "Filtro ativo";
                        }

                        if (!displayValue) return null;

                        return (
                            <div key={column.id} className="inline-flex items-center bg-[#008080] text-white px-3 py-1 rounded-full text-sm">
                                <span className="mr-2">
                                    {headerText}: {displayValue}
                                </span>
                                <button
                                    onClick={() => {
                                        try {
                                            column.setFilterValue(
                                                (column.columnDef.filterFn as unknown) === "numberRange" ? [undefined, undefined] : undefined
                                            );
                                        } catch (error) {
                                            console.warn("Erro ao remover filtro:", error);
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
                <table className="table-auto shadow min-w-full divide-y divide-gray-200">
                    {isInitialized && (
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr
                                    key={headerGroup.id}
                                    className="bg-gray-100 rounded-lg text-sm font-medium text-gray-700 text-left relative"
                                >
                                    {headerGroup.headers.map((header, index) => {
                                        if (isSmallScreen && index !== 0) return null;
                                        const column = header.column;
                                        const isSorted = column.getIsSorted();
                                        const headerDef = column.columnDef.header;
                                        const headerText = typeof headerDef === "string" ? headerDef : "coluna";
                                        const renderedHeader = flexRender(headerDef, header.getContext());

                                        let headerLabel: React.ReactNode = renderedHeader;
                                        if (headerDef === "Ação") {
                                            const distinct = new Set(rows.map((r: Row<any>) => r.original.cd_nm_acao)).size;
                                            headerLabel = `Ação (${distinct})`;
                                        } else if (headerDef === "Sub-ação") {
                                            headerLabel = `Sub-ação (${rows.length})`;
                                        } else if (headerDef === "Total Empenhado") {
                                            const total = rows.reduce((sum: number, r: Row<any>) => sum + (r.original.vlrdotatualizada ?? 0), 0);
                                            const formatted =
                                                total >= 1_000_000_000
                                                    ? `R$ ${(total / 1_000_000_000).toFixed(1).replace(".0", "")} Bi`
                                                    : total >= 1_000_000
                                                    ? `R$ ${(total / 1_000_000).toFixed(1).replace(".0", "")} Mi`
                                                    : `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                                            headerLabel = `Total Empenhado (${formatted})`;
                                        } else if (headerDef === "Total Pago") {
                                            const total = rows.reduce((sum: number, r: Row<any>) => sum + (r.original.vlrtotalpago ?? 0), 0);
                                            const formatted =
                                                total >= 1_000_000_000
                                                    ? `R$ ${(total / 1_000_000_000).toFixed(1).replace(".0", "")} Bi`
                                                    : total >= 1_000_000
                                                    ? `R$ ${(total / 1_000_000).toFixed(1).replace(".0", "")} Mi`
                                                    : `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                                            headerLabel = `Total Pago (${formatted})`;
                                        }

                                        return (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 border-gray-200 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider"
                                            >
                                                <button
                                                    onClick={column.getCanSort() ? column.getToggleSortingHandler() : undefined}
                                                    className="flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2 rounded px-1 -mx-1"
                                                    aria-label={`Ordenar por ${headerText}${
                                                        isSorted ? (isSorted === "desc" ? " em ordem decrescente" : " em ordem crescente") : ""
                                                    }`}
                                                    aria-sort={isSorted ? (isSorted === "desc" ? "descending" : "ascending") : "none"}
                                                >
                                                    {isSorted === "desc" ? (
                                                        <ChevronDown size={16} className="text-gray-600" aria-hidden="true" />
                                                    ) : isSorted === "asc" ? (
                                                        <ChevronUp size={16} className="text-gray-600" aria-hidden="true" />
                                                    ) : (
                                                        <ChevronsUpDown size={16} className="text-gray-400" aria-hidden="true" />
                                                    )}
                                                    {headerLabel}
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                    )}

                    {showFilters && (
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr key={`filter-${headerGroup.id}`} className="bg-gray-50">
                                    {headerGroup.headers.map((header, index) => {
                                        if (isSmallScreen && index !== 0) return null;
                                        const column = header.column;
                                        const meta = (column.columnDef.meta ?? {}) as ColumnMeta;
                                        const FilterComp = meta.Filter;
                                        return (
                                            <th key={`filter-${header.id}`} className="px-6 py-3 border-t border-gray-200">
                                                {column.getCanFilter() && FilterComp ? (
                                                    <div ref={index === 0 ? firstFilterRef : null}>
                                                        <FilterComp column={column} table={table} />
                                                    </div>
                                                ) : null}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                    )}

                    {isInitialized && (
                        <tbody className="bg-white divide-y divide-gray-200 text-sm font-normal text-gray-700">
                            {pageRows.map((row) => {
                                const rowType = row.original?.type;
                                const rowClass =
                                    rowType === "good"
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : rowType === "bad"
                                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                        : "hover:bg-gray-100";
                                const textClass = rowType === "good" || rowType === "bad" ? "text-white" : "text-gray-700";
                                const visibleCells = row.getVisibleCells();
                                const cellsToRender = isSmallScreen ? visibleCells.slice(0, 1) : visibleCells;

                                return (
                                    <React.Fragment key={row.id}>
                                        <tr className={`border-b border-gray-200 ${rowClass}`}>
                                            {isSmallScreen ? (
                                                <td className="px-6 py-4">
                                                    <div className={`hover:bg-gray-100 border-b border-gray-200 p-3 ${textClass}`}>
                                                        {visibleCells.map((cell) => {
                                                            const h = cell.column.columnDef.header;
                                                            const label = typeof h === "function" ? "Extensão executada" : String(h ?? "");
                                                            return (
                                                                <div key={cell.id} className="mb-2">
                                                                    <strong>{label}:</strong>{" "}
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            ) : (
                                                cellsToRender.map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className={`px-6 py-4 text-sm leading-5 break-words ${textClass}`}
                                                        style={{ width: "20%" }}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                        {row.getIsExpanded() && allColumns && (
                                            <tr>
                                                <td colSpan={visibleCells.length}>
                                                    <div className="p-4 bg-[#008080] text-white transition-all duration-300 ease-in-out overflow-hidden">
                                                        <div className="mb-2">
                                                            <strong>Tipo de Ação:</strong>{" "}
                                                            {rowType === "good" ? "Boa Ação" : rowType === "bad" ? "Má Ação" : "Ação Neutra"}
                                                        </div>
                                                        {allColumns.map((col: any) => {
                                                            const key = col.accessorKey ?? col.id;
                                                            if (!key) return null;
                                                            const value = row.original[key];
                                                            const headerText = typeof col.header === "string" ? col.header : String(key);
                                                            const formatted = col.cell
                                                                ? col.cell({ getValue: () => value, row, column: { id: key } } as any)
                                                                : String(value);
                                                            return (
                                                                <div key={key} className="mb-2">
                                                                    <strong>{headerText}:</strong> {formatted}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    )}
                </table>

                <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            {rows.length} resultados • Página {pageIndex + 1} de {Math.max(pageCount, 1)}
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                to="/contato"
                                search={{ message: "Encontrei um erro na tabela de Estruturas do PDC:\n\nDescreva o erro encontrado:\n" } as never}
                                className="text-xs text-gray-500 hover:text-[#008080] hover:underline transition-colors"
                            >
                                Reportar erro
                            </Link>

                            <div className="flex items-center space-x-1">
                                <button
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        table.getCanPreviousPage() ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                                    }`}
                                    onClick={() => table.getCanPreviousPage() && table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    ← Anterior
                                </button>

                                <button
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        table.getCanNextPage() ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                                    }`}
                                    onClick={() => table.getCanNextPage() && table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Próxima →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Table;
