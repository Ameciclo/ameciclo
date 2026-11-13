import { Link } from "@tanstack/react-router";
import React, { useState } from "react";
import Table from "../Commom/Table/Table";
import { tableColumnHelper, type ColumnFilterProps } from "../Commom/Table/features";
import { asRange, between } from "../Commom/Table/TableFilters";

interface IdecicloRow {
    id: number | string;
    logradouro: string;
    cidade: number;
    tipologia: string;
    comprimento: number;
    nota: number;
}

const columnHelper = tableColumnHelper<IdecicloRow>();

function ColumnFilter({ column }: ColumnFilterProps<IdecicloRow>) {
    const filterValue = column.getFilterValue();
    return (
        <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-ameciclo focus:border-transparent"
            type="text"
            placeholder="Buscar..."
            value={typeof filterValue === "string" ? filterValue : ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
        />
    );
}

function NumberRangeColumnFilter({ column, rows }: ColumnFilterProps<IdecicloRow>) {
    const [filterMin, filterMax] = asRange(column.getFilterValue());
    const values = rows.map((row) => Number(row.getValue(column.id)));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;

    return (
        <div className="flex gap-2 items-center">
            <input
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-ameciclo"
                value={filterMin || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [val ? parseFloat(val) : undefined, asRange(old)[1]]);
                }}
                placeholder={`${min.toFixed(1)}`}
            />
            <span className="text-xs text-gray-500">a</span>
            <input
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-ameciclo"
                value={filterMax || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [asRange(old)[0], val ? parseFloat(val) : undefined]);
                }}
                placeholder={`${max.toFixed(1)}`}
            />
        </div>
    );
}

function SelectColumnFilter({ column, rows }: ColumnFilterProps<IdecicloRow>) {
    const filterValue = column.getFilterValue();
    const options = Array.from(new Set(rows.map((row) => String(row.getValue(column.id)))));

    return (
        <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-ameciclo focus:border-transparent"
            value={typeof filterValue === "string" ? filterValue : ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        >
            <option value="">Todos</option>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

export const IdecicloTable = ({ title, data }: { title: string; data: IdecicloRow[] }) => {
    const [showFilters, setShowFilters] = useState(false);

    const columns = React.useMemo(
        () => columnHelper.columns([
            columnHelper.accessor("logradouro", {
              header: "Rua",
                cell: ({ row }) => (
                    <Link
                        to="/dados/ideciclo/$id"
                        params={{ id: String(row.original.id) }}
                        className={`hover:underline ${row.original.cidade === 1 ? "text-ameciclo font-medium" : "text-gray-700"
                            }`}
                    >
                        {row.original.logradouro}
                    </Link>
                ),
                meta: { Filter: ColumnFilter },
            }),
            columnHelper.accessor("tipologia", {
              header: "Tipo",
                meta: { Filter: SelectColumnFilter },
            }),
            columnHelper.accessor("comprimento", {
              header: "Extensão (km)",
                cell: ({ getValue }) => {
                    const value = getValue();
                    return <span>{value ? value.toFixed(2).replace(".", ",") : "N/A"}</span>;
                },
                meta: { Filter: NumberRangeColumnFilter },
                filterFn: between,
            }),
            columnHelper.accessor("nota", {
              header: "Nota Geral",
                cell: ({ getValue }) => {
                    const value = getValue();
                    return (
                        <span className={`font-medium ${value >= 7 ? "text-green-600" :
                                value >= 5 ? "text-yellow-600" :
                                    value ? "text-red-600" : "text-gray-500"
                            }`}>
                            {value ? value.toFixed(1).replace(".", ",") : "N/A"}
                        </span>
                    );
                },
                meta: { Filter: NumberRangeColumnFilter },
                filterFn: between,
            }),
        ]),
        []
    );

    return (
        <div className="relative">
            <div className="top-32 relative inline-flex items-center justify-center mb-10 w-full">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%" height="57" viewBox="0 0 488 57"
                    fill="none"
                    className="absolute bottom-[-30px] transform drop-shadow-xs w-auto scale-x-[0.75] sm:scale-x-125"
                    style={{ filter: 'drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.25))' }}
                >
                    <g filter="url(#filter0_d_70_1545)">
                        <path d="M11.6927 40.3593C10.2043 30.641 9.60985 21.6183 8.1481 12.164C7.98157 11.4008 8.10602 10.6078 8.50062 9.91808C8.89523 9.22838 9.53588 8.68404 10.315 8.37649C12.9226 7.57581 15.5928 6.95989 18.3022 6.53414C24.5505 5.76637 30.8726 5.19604 37.1746 5.00028C85.4814 3.47748 133.763 1.82281 182.147 3.22804C222.259 4.34244 262.451 3.80446 302.562 4.87483C350.874 6.19271 399.124 8.52419 447.391 10.2389C481.936 11.4756 516.478 12.5215 551.019 13.3765C565.86 13.7551 580.741 13.4287 595.579 13.5211C598.359 13.493 601.143 13.7952 604.357 14.049C605.236 14.22 606.008 14.6994 606.507 15.3852C607.006 16.0711 607.194 16.9093 607.031 17.7216L604.618 42.2335C604.6 42.8809 604.362 43.5072 603.937 44.0248C603.513 44.5425 602.923 44.9254 602.25 45.1201C600.993 45.4048 599.712 45.5872 598.421 45.6653C546.346 46.7197 494.278 48.4126 442.218 48.6079C385.341 48.83 328.427 47.8191 271.541 47.0723C242.558 46.7044 213.59 45.4554 184.608 45.1535C151.528 44.8709 118.41 45.6898 85.3052 45.3635C62.3404 45.155 38.5985 43.9413 14.4287 43.0843C13.6979 42.9948 13.0245 42.6735 12.525 42.1759C12.0254 41.6784 11.731 41.0358 11.6927 40.3593Z" fill="#CE4831" />
                    </g>
                </svg>
                <h2
                    className="text-2xl sm:text-5xl font-bold bg-[#EFC345] text-gray-700 rounded-[2.5rem] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] inline-flex items-center justify-center h-24 px-8.75 py-4 gap-4 shrink-0 relative z-10">
                    {title}
                </h2>
            </div>
            <Table
                data={data}
                columns={columns}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
            />
            <div className="mx-auto relative z-0 translate-y-[-25px] md:translate-y-[-50px]">
                <img className="min-h-[100px] w-full object-cover" src="/ideciclo/ideciclo-ciclovia.png" alt="Imagem decorativa de ciclovia" />
            </div>
        </div>
    );
};
