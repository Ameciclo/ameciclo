import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
    type Column,
    type ReactTable,
    type RowData,
    type SortingState,
    sortFn_alphanumeric,
    useTable,
} from "@tanstack/react-table";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
    features,
    type ColumnFilterProps,
    type TableColumn,
    type TableFeaturesOf,
    type TableRowOf,
} from "./features";
import { asRange, numberRangeFilterFn, startsWithText } from "./TableFilters";

export { numberRangeFilterFn } from "./TableFilters";
export type { TableColumn } from "./features";

const SMALL_SCREEN_WIDTH = 768;

type TableInstance<TData extends RowData> = ReactTable<TableFeaturesOf, TData>;
type TableColumnOf<TData extends RowData> = Column<TableFeaturesOf, TData, unknown>;

// One line of the legacy expanded-row detail panel.
export type DetailField<TData extends RowData> = {
    label: string;
    render: (original: TData) => ReactNode;
};

export type FilterType = "all" | "good" | "bad";

export function NumberRangeColumnFilter<TData extends RowData>({ column }: ColumnFilterProps<TData>) {
    const [min, max] = asRange(column.getFilterValue());

    return (
        <div className="flex space-x-2">
            <input
                value={min || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [val ? Number(val) : undefined, asRange(old)[1]]);
                }}
                placeholder="Mínimo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                value={max || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [asRange(old)[0], val ? Number(val) : undefined]);
                }}
                placeholder="Máximo"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}

function DefaultColumnFilter<TData extends RowData>({ column }: ColumnFilterProps<TData>) {
    const header = column.columnDef.header;
    const filterValue = column.getFilterValue();

    return (
        <input
            value={typeof filterValue === "string" ? filterValue : ''}
            onChange={e => {
                column.setFilterValue(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
            placeholder={`Buscar ${typeof header === 'string' ? header : ''}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-blue-500 focus:border-blue-500"
        />
    );
}

// Reads a field of a row whose shape the table does not know.
function fieldOf(original: unknown, key: string): unknown {
    return typeof original === "object" && original !== null && key in original ? Reflect.get(original, key) : undefined;
}

// Rows of the LOA table carry a `type` that colors them.
function rowTypeOf(original: unknown): string | undefined {
    const type = fieldOf(original, "type");
    return typeof type === "string" ? type : undefined;
}

function sumOf<TData extends RowData>(rows: TableRowOf<TData>[], key: string) {
    return rows.reduce((sum, row) => {
        const value = fieldOf(row.original, key);
        return sum + (typeof value === "number" ? value : 0);
    }, 0);
}

function formatTotal(total: number) {
    if (total >= 1000000000) return `R$ ${(total / 1000000000).toFixed(1).replace('.0', '')} Bi`;
    if (total >= 1000000) return `R$ ${(total / 1000000).toFixed(1).replace('.0', '')} Mi`;
    return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function columnTitle<TData extends RowData>(column: TableColumnOf<TData>) {
    const header = column.columnDef.header;
    return typeof header === 'string' ? header : null;
}

function TableSkeleton({ title }: { title?: string }) {
    return (
        <section className="container mx-auto my-10 shadow-2xl rounded-sm p-2 sm:p-12 overflow-auto bg-gray-100">
            <div className="mb-4">
                <h2 className="text-gray-600 text-3xl mb-2">{title}</h2>
            </div>
            <div className="shadow-sm overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="h-4 bg-gray-300 rounded-sm w-20 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="h-4 bg-gray-300 rounded-sm w-16 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="h-4 bg-gray-300 rounded-sm w-32 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="h-4 bg-gray-300 rounded-sm w-16 animate-pulse"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-300 rounded-sm w-full animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-300 rounded-sm w-24 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-300 rounded-sm w-16 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-300 rounded-sm w-12 animate-pulse"></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function headerLabel<TData extends RowData>(column: TableColumnOf<TData>, rows: TableRowOf<TData>[], fallback: ReactNode) {
    const header = column.columnDef.header;
    if (header === 'Ação') return `Ação (${new Set(rows.map((row) => fieldOf(row.original, "cd_nm_acao"))).size})`;
    if (header === 'Sub-ação') return `Sub-ação (${rows.length})`;
    if (header === 'Total Empenhado') return `Total Empenhado (${formatTotal(sumOf(rows, "vlrdotatualizada"))})`;
    if (header === 'Total Pago') return `Total Pago (${formatTotal(sumOf(rows, "vlrtotalpago"))})`;
    return fallback;
}

function TableHead<TData extends RowData>({ table, isSmallScreen, rows }: { table: TableInstance<TData>; isSmallScreen: boolean; rows: TableRowOf<TData>[] }) {
    return (
        <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr
                    key={headerGroup.id}
                    className="bg-gray-100 rounded-lg text-sm font-medium text-gray-700 text-left relative"
                >
                    {headerGroup.headers.map((header, index) => {
                        if (isSmallScreen && index !== 0) return null;
                        const column = header.column;
                        const sorted = column.getIsSorted();
                        return (
                            <th
                                key={header.id}
                                className="px-6 py-3 border-gray-200 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider"
                            >
                                <button
                                    onClick={column.getToggleSortingHandler()}
                                    className="flex items-center gap-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ameciclo focus:ring-offset-2 rounded-sm px-1 -mx-1"
                                    aria-label={`Ordenar por ${columnTitle(column) ?? 'coluna'}${sorted ? (sorted === 'desc' ? ' em ordem decrescente' : ' em ordem crescente') : ''}`}
                                    aria-sort={sorted ? (sorted === 'desc' ? 'descending' : 'ascending') : 'none'}
                                >
                                    {sorted ? (
                                        sorted === 'desc' ? (
                                            <ChevronDown size={16} className="text-gray-600" aria-hidden="true" />
                                        ) : (
                                            <ChevronUp size={16} className="text-gray-600" aria-hidden="true" />
                                        )
                                    ) : (
                                        <ChevronsUpDown size={16} className="text-gray-400" aria-hidden="true" />
                                    )}
                                    {headerLabel(column, rows, <table.FlexRender header={header} />)}
                                </button>
                            </th>
                        );
                    })}
                </tr>
            ))}
        </thead>
    );
}

function ExpandedDetail<TData extends RowData>({ row, columnCount, allColumns }: { row: TableRowOf<TData>; columnCount: number; allColumns: DetailField<TData>[] }) {
    const type = rowTypeOf(row.original);
    return (
        <tr>
            <td colSpan={columnCount}>
                <div className="p-4 bg-ameciclo text-white transition-all duration-300 ease-in-out overflow-hidden">
                    <div className="mb-2">
                        <strong>Tipo de Ação:</strong> {type === 'good' ? 'Boa Ação' : type === 'bad' ? 'Má Ação' : 'Ação Neutra'}
                    </div>
                    {allColumns.map((field) => (
                        <div key={field.label} className="mb-2">
                            <strong>{field.label}:</strong> {field.render(row.original)}
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
}

function TableBody<TData extends RowData>({
    table,
    isSmallScreen,
    columnCount,
    allColumns = [],
}: {
    table: TableInstance<TData>;
    isSmallScreen: boolean;
    columnCount: number;
    allColumns?: DetailField<TData>[];
}) {
    return (
        <tbody className="bg-white divide-y divide-gray-200 text-sm font-normal text-gray-700">
            {table.getRowModel().rows.map((row) => {
                const type = rowTypeOf(row.original);
                const colored = type === 'good' || type === 'bad';
                const hasDetail = row.getIsExpanded() && row.subRows.length === 0;
                return isSmallScreen ? (
                    <React.Fragment key={row.id}>
                        <tr
                            className={`border-b border-gray-200 ${type === 'good' ? 'bg-blue-600 text-white hover:bg-blue-200' : type === 'bad' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'hover:bg-gray-100'}`}
                        >
                            <td className="px-6 py-4">
                                <div className={`hover:bg-gray-100 border-b border-gray-200 p-3 ${colored ? 'text-white' : ''}`}>
                                    <div>
                                        {row.getAllCells().map((cell) => {
                                            const header = cell.column.columnDef.header;
                                            return (
                                                <div key={cell.id} className="mb-2">
                                                    <strong>{typeof header === 'function' ? 'Extensão executada' : header}:</strong> <table.FlexRender cell={cell} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {hasDetail ? <ExpandedDetail row={row} columnCount={columnCount} allColumns={allColumns} /> : null}
                    </React.Fragment>
                ) : (
                    <React.Fragment key={row.id}>
                        <tr
                            className={`border-b border-gray-200 ${type === 'good' ? 'bg-blue-600 text-white hover:bg-blue-700' : type === 'bad' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'hover:bg-gray-100'}`}
                        >
                            {row.getAllCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className={`px-6 py-4 text-sm leading-5 wrap-break-word ${colored ? 'text-white' : 'text-gray-700'}`}
                                    style={{ width: '20%' }}
                                >
                                    <table.FlexRender cell={cell} />
                                </td>
                            ))}
                        </tr>
                        {hasDetail ? <ExpandedDetail row={row} columnCount={columnCount} allColumns={allColumns} /> : null}
                    </React.Fragment>
                );
            })}
        </tbody>
    );
}

function TableFooter<TData extends RowData>({ table, resultCount }: { table: TableInstance<TData>; resultCount: number }) {
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();

    return (
        <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    {resultCount} resultados • Página {table.state.pagination.pageIndex + 1} de {table.getPageOptions().length || 1}
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        to="/contato"
                        search={{ message: "Encontrei um erro na tabela de Estruturas do PDC:\n\nDescreva o erro encontrado:\n" }}
                        className="text-xs text-gray-500 hover:text-ameciclo hover:underline transition-colors"
                    >
                        Reportar erro
                    </Link>

                    <div className="flex items-center space-x-1">
                        <button
                            className={`px-2 py-1 text-xs rounded transition-colors ${canPreviousPage
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                            onClick={() => canPreviousPage && table.previousPage()}
                            disabled={!canPreviousPage}
                        >
                            ← Anterior
                        </button>

                        <button
                            className={`px-2 py-1 text-xs rounded transition-colors ${canNextPage
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                            onClick={() => canNextPage && table.nextPage()}
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

function ActiveFilters<TData extends RowData>({ table }: { table: TableInstance<TData> }) {
    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2">
                {table.getAllLeafColumns().filter((column) => {
                    const filterValue = column.getFilterValue();
                    return Boolean(filterValue) &&
                        (Array.isArray(filterValue) ? filterValue.some((val) => val !== undefined && val !== '') : filterValue !== '');
                }).map((column) => {
                    const header = column.columnDef.header;
                    const headerText = typeof header === 'string' ? header : 'Extensão executada';
                    const filterValue = column.getFilterValue();
                    const isNumberRange = column.columnDef.filterFn === numberRangeFilterFn;
                    let displayValue = '';

                    if (column.id === 'total_cyclists') {
                        const [minVal, maxVal] = asRange(filterValue);
                        if (minVal && maxVal) {
                            displayValue = `de ${minVal} a ${maxVal}`;
                        } else if (minVal) {
                            displayValue = `a partir de ${minVal}`;
                        } else if (maxVal) {
                            displayValue = `até ${maxVal}`;
                        }
                    } else if (isNumberRange) {
                        const [minVal, maxVal] = asRange(filterValue);
                        const money = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                        if (minVal && maxVal) {
                            displayValue = `de ${money(minVal)} a ${money(maxVal)}`;
                        } else if (minVal) {
                            displayValue = `a partir de ${money(minVal)}`;
                        } else if (maxVal) {
                            displayValue = `até ${money(maxVal)}`;
                        }
                    } else if (headerText.includes('Extensão')) {
                        displayValue = `~${filterValue} km`;
                    } else {
                        displayValue = String(filterValue);
                    }

                    if (!displayValue) return null;

                    return (
                        <div key={column.id} className="inline-flex items-center bg-ameciclo text-white px-3 py-1 rounded-full text-sm">
                            <span className="mr-2">{headerText}: {displayValue}</span>
                            <button
                                onClick={() => column.setFilterValue(isNumberRange ? [undefined, undefined] : undefined)}
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
    );
}

type TableProps<TData extends RowData> = {
    title?: string;
    data: TData[];
    columns: TableColumn<TData>[];
    // Fields listed in the expanded-row detail panel (rows without sub-rows).
    allColumns?: DetailField<TData>[];
    showFilters?: boolean;
    setShowFilters?: (show: boolean) => void;
    subtitle?: ReactNode;
    filterType?: FilterType;
    setFilterType?: (type: FilterType) => void;
    pageLoa?: boolean;
    customHeader?: ReactNode;
    // Initial order; when given, clicking a header flips asc/desc instead of dropping the sort.
    initialSortBy?: SortingState;
    // Makes a row the parent of other rows, which open with `row.toggleExpanded()`.
    getSubRows?: (row: TData) => TData[] | undefined;
};

function LoadedTable<TData extends RowData>({
    title,
    data,
    columns,
    allColumns,
    showFilters,
    setShowFilters,
    subtitle,
    filterType,
    setFilterType,
    pageLoa,
    customHeader,
    initialSortBy,
    getSubRows,
}: TableProps<TData>) {
    const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < SMALL_SCREEN_WIDTH : false);
    const [shouldBlink, setShouldBlink] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const firstFilterRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showFilters && firstFilterRef.current) {
            setTimeout(() => {
                firstFilterRef.current?.focus();
            }, 100);
        }
    }, [showFilters]);

    const table = useTable({
        features,
        columns,
        data,
        getSubRows,
        initialState: { pagination: { pageIndex: 0, pageSize: 5 }, sorting: initialSortBy ?? [], expanded: {} },
        // With an initial order, clicking a header flips asc/desc instead of dropping the sort.
        enableSortingRemoval: initialSortBy === undefined,
        // Every column starts ascending, whatever its type.
        sortDescFirst: false,
        // A parent row stays visible when only one of its sub-rows matches a filter.
        filterFromLeafRows: true,
        defaultColumn: { filterFn: startsWithText, sortFn: sortFn_alphanumeric },
    });

    useEffect(() => {
        const checkScreenSize = () => {
            const isSmall = window.innerWidth < SMALL_SCREEN_WIDTH;
            setIsSmallScreen(isSmall);
            table.setPageSize(isSmall ? 5 : 10);
            if (!isInitialized) {
                setIsInitialized(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
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

        const tableSection = document.querySelector('section.container');
        if (tableSection) observer.observe(tableSection);

        return () => observer.disconnect();
    }, []);

    // Rows after filter, sort and expand, before they are split in pages.
    const rows = table.getPrePaginatedRowModel().rows;
    const preFilteredRows = table.getPreFilteredRowModel().rows;

    return (
        <section className="container mx-auto my-10 shadow-2xl rounded-sm p-2 sm:p-12 overflow-auto bg-gray-100">
            {customHeader && (
                <div className="mb-6">
                    {customHeader}
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                    {!customHeader && <h2 className="text-gray-600 text-3xl mb-2">{title}</h2>}

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
                            ? 'bg-ameciclo text-white border-ameciclo'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        style={{
                            animation: shouldBlink ? 'blinkAmeciclo 2s ease-in-out 2' : 'none'
                        }}
                        aria-label={showFilters
                            ? "Ocultar campos de filtro abaixo das colunas"
                            : "Mostrar campos de filtro abaixo das colunas da tabela"}
                        title={showFilters
                            ? "Ocultar filtros"
                            : "Clique para exibir campos de filtro abaixo de cada coluna"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="hidden md:inline">Filtros</span>
                    </button>
                )}
            </div>

            {/* Filtros ativos */}
            <ActiveFilters table={table} />
            <div className="shadow-sm overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
                <table className="table-auto shadow-sm min-w-full divide-y divide-gray-200">
                    {isInitialized && <TableHead table={table} isSmallScreen={isSmallScreen} rows={rows} />}
                    {showFilters && (
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={`filter-${headerGroup.id}`} className="bg-gray-50">
                                    {headerGroup.headers.map((header, index) => {
                                        if (isSmallScreen && index !== 0) return null;
                                        const column = header.column;
                                        const Filter = column.columnDef.meta?.Filter ?? DefaultColumnFilter;
                                        return (
                                            <th
                                                key={`filter-${header.id}`}
                                                className="px-6 py-3 border-t border-gray-200"
                                            >
                                                {column.getCanFilter() ? (
                                                    <div ref={index === 0 ? firstFilterRef : null}>
                                                        <Filter column={column} rows={preFilteredRows} />
                                                    </div>
                                                ) : null}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                    )}

                    {isInitialized && <TableBody
                        table={table}
                        isSmallScreen={isSmallScreen}
                        columnCount={columns.length}
                        allColumns={allColumns}
                    />}
                </table>
                <TableFooter table={table} resultCount={rows.length} />
            </div>
        </section>
    );
}

const Table = <TData extends RowData>(props: TableProps<TData>) => {
    const { title, data } = props;

    const safeData = useMemo(() => {
        if (!Array.isArray(data)) {
            console.warn('Table data is not an array:', data);
            return [];
        }
        return data.filter(item => item && typeof item === 'object');
    }, [data]);

    if (safeData.length === 0) return <TableSkeleton title={title} />;

    return <LoadedTable {...props} data={safeData} />;
};

export default Table;
