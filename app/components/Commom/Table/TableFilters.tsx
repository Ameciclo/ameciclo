import React from "react";

export const ColumnFilter = ({ column }: any) => {
    const { filterValue, setFilter } = column;
    return (
        <>
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 px-4 rounded-lg text-sm focus:outline-none"
                type="search"
                name="search"
                placeholder="Buscar"
                value={filterValue || ""}
                onChange={(e) => setFilter(e.target.value)}
            />
        </>
    );
};

export function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
    const options = React.useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach((row: any) => {
            options.add(row.values[id]);
        });
        return Array.from(options.values());
    }, [id, preFilteredRows]);

    return (
        <select
            className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
            value={filterValue}
            onChange={(e) => {
                setFilter(e.target.value || undefined);
            }}
        >
            <option value="">Todos tipos</option>
            {(options as string[]).map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}