import React from "react";
import { Link } from "@remix-run/react";
import { matchSorter } from "match-sorter";
import Table from "../Commom/Table/Table";

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;
export const CountsTable = ({ data }: any) => {
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

    const ColumnFilter = ({ column }: any) => {
        const { filterValue, setFilter } = column;
        return (
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 px-4 rounded-lg text-sm focus:outline-none"
                type="search"
                name="search"
                placeholder="Buscar"
                value={filterValue || ""}
                onChange={(e) => setFilter(e.target.value)}
            />
        );
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Nome",
                accessor: "name",
                Cell: ({ row }: any) => (
                    <Link
                        className="text-ameciclo"
                        to={`/contagens/${row.original.slug}`}
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
                    <span>{value.substr(0, 10).split("-").reverse().join("/")}</span>
                ),
                Filter: ColumnFilter,
            },
            {
                Header: "Total de Ciclistas",
                accessor: "total_cyclists",
                Filter: ColumnFilter,
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

    return <Table title={"Nossas contagens"} data={data} columns={columns} />;
};
