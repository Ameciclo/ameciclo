import { Link } from "@remix-run/react";
import React, { useState } from "react";
import Table from "../Commom/Table/Table";

function ColumnFilter({ column }: any) {
    const { filterValue, setFilter } = column;
    return (
        <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            type="text"
            placeholder="Buscar..."
            value={filterValue || ""}
            onChange={(e) => setFilter(e.target.value)}
        />
    );
}

function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }: any) {
    const [min, max] = React.useMemo(() => {
        let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        preFilteredRows.forEach((row: any) => {
            min = Math.min(row.values[id], min);
            max = Math.max(row.values[id], max);
        });
        return [min, max];
    }, [id, preFilteredRows]);

    return (
        <div className="flex gap-2 items-center">
            <input
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#008080]"
                value={filterValue[0] || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    setFilter((old = []) => [val ? parseFloat(val) : undefined, old[1]]);
                }}
                placeholder={`${min.toFixed(1)}`}
            />
            <span className="text-xs text-gray-500">a</span>
            <input
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#008080]"
                value={filterValue[1] || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    setFilter((old = []) => [old[0], val ? parseFloat(val) : undefined]);
                }}
                placeholder={`${max.toFixed(1)}`}
            />
        </div>
    );
}

function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }: any) {
    const options = React.useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach((row: any) => {
            options.add(row.values[id]);
        });
        return Array.from(options.values());
    }, [id, preFilteredRows]);

    return (
        <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            value={filterValue}
            onChange={(e) => setFilter(e.target.value || undefined)}
        >
            <option value="">Todos</option>
            {(options as string[]).map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

export const IdecicloTable = ({ title, data }: any) => {
    const [showFilters, setShowFilters] = useState(false);

    const columns = React.useMemo(
        () => [
            {
                Header: "Rua",
                accessor: "logradouro",
                Cell: ({ row }: any) => (
                    <Link 
                        to={`/dados/ideciclo/${row.original.id}`} 
                        className={`hover:underline ${
                            row.original.cidade === 1 ? "text-[#008080] font-medium" : "text-gray-700"
                        }`}
                    >
                        {row.original.logradouro}
                    </Link>
                ),
                Filter: ColumnFilter,
            },
            {
                Header: "Tipo",
                accessor: "tipologia",
                Filter: SelectColumnFilter,
            },
            {
                Header: "Extensão (km)",
                accessor: "comprimento",
                Cell: ({ value }: any) => (
                    <span>{value ? value.toFixed(2).replace(".", ",") : "N/A"}</span>
                ),
                Filter: NumberRangeColumnFilter,
                filter: 'between',
            },
            {
                Header: "Nota Geral",
                accessor: "nota",
                Cell: ({ value }: any) => (
                    <span className={`font-medium ${
                        value >= 7 ? "text-green-600" : 
                        value >= 5 ? "text-yellow-600" : 
                        value ? "text-red-600" : "text-gray-500"
                    }`}>
                        {value ? value.toFixed(1).replace(".", ",") : "N/A"}
                    </span>
                ),
                Filter: NumberRangeColumnFilter,
                filter: 'between',
            },
        ],
        []
    );

    return (
        <div className="relative">
            <Table 
                title={title}
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
