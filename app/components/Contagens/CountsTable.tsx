import React from "react";
import { Link } from "@remix-run/react";
import { matchSorter } from "match-sorter";
import Table from "../Commom/Table/Table";
import { ColumnFilter } from "../Commom/Table/TableFilters";

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;

export const CountsTable = ({ data }: any) => {
    const safeData = data || [];
    const [cyclistFilter, setCyclistFilter] = React.useState<[number | undefined, number | undefined]>([undefined, undefined]);
    const [filteredData, setFilteredData] = React.useState(safeData);

    React.useEffect(() => {
        if (cyclistFilter[0] || cyclistFilter[1]) {
            const filtered = safeData.filter((item: any) => {
                const value = item?.total_cyclists || 0;
                const min = cyclistFilter[0] || 0;
                const max = cyclistFilter[1] || Infinity;
                return value >= min && value <= max;
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(safeData);
        }
    }, [cyclistFilter, safeData]);

    const minMax = React.useMemo(() => {
        if (!safeData.length) return [0, 0];
        const values = safeData.map((d: any) => d?.total_cyclists || 0).filter(v => v > 0);
        if (values.length === 0) return [0, 0];
        return [Math.min(...values), Math.max(...values)];
    }, [safeData]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Nome",
                accessor: "name",
                Cell: ({ row }: any) => (
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
                Cell: ({ value }: any) => (
                    <span>{value ? value.substr(0, 10).split("-").reverse().join("/") : "N/A"}</span>
                ),
                Filter: ColumnFilter,
            },
            {
                Header: "Total de Ciclistas",
                accessor: "total_cyclists",
                disableFilters: true,
            },
            {
                Header: "Dados",
                Cell: ({ row }: any) => (
                    <Link
                        className="text-ameciclo"
                        to={`http://api.garfo.ameciclo.org/cyclist-counts/edition/${row.original.id}`}
                    >
                        JSON
                    </Link>
                ),
                disableFilters: true,
            },
        ],
        []
    );

    if (!safeData.length) {
        return (
            <div className="container mx-auto my-10 p-8 text-center">
                <p className="text-gray-600">Nenhuma contagem encontrada.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="container mx-auto mb-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <label className="text-gray-700 font-medium">Filtrar por Total de Ciclistas:</label>
                    <div className="flex items-center gap-2">
                        <input
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            type="number"
                            placeholder={`Min(${minMax[0]})`}
                            value={cyclistFilter[0] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCyclistFilter(prev => [val ? parseInt(val) : undefined, prev[1]]);
                            }}
                        />
                        <span className="text-gray-500">a</span>
                        <input
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            type="number"
                            placeholder={`Max(${minMax[1]})`}
                            value={cyclistFilter[1] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCyclistFilter(prev => [prev[0], val ? parseInt(val) : undefined]);
                            }}
                        />
                        <button
                            className="px-3 py-1 bg-ameciclo text-white rounded hover:bg-opacity-80"
                            onClick={() => setCyclistFilter([undefined, undefined])}
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>
            <Table title={"Nossas contagens"} data={filteredData} columns={columns} />
        </div>
    );
};
