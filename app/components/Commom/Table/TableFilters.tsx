import React from "react";

export const ColumnFilter = ({ column, placeholder = "Buscar" }: { column: any; placeholder?: string }) => {
    const filterValue = column.getFilterValue() as string | undefined;
    return (
        <input
            className="my-2 w-full text-gray-600 border-2 border-gray-300 bg-white h-10 px-4 rounded-lg text-sm focus:outline-none"
            type="text"
            placeholder={placeholder}
            value={filterValue ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        />
    );
};

export function NumberRangeColumnFilter({ column }: { column: any }) {
    const filterValue = (column.getFilterValue() as [number | undefined, number | undefined]) ?? [];
    const [facetedMin, facetedMax] = (column.getFacetedMinMaxValues?.() as [number, number] | undefined) ?? [0, 0];

    return (
        <div style={{ display: "flex" }}>
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 rounded-lg text-sl text-center focus:outline-none"
                value={filterValue[0] ?? ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: [number | undefined, number | undefined] | undefined) => [
                        val ? parseFloat(val) : undefined,
                        old?.[1],
                    ]);
                }}
                placeholder={`Mín(${facetedMin.toFixed(1)})`}
                style={{ width: "70px", marginRight: "0.5rem" }}
            />
            <div className="my-5 max-w-sm text-gray-600 text-sl text-center">a</div>
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 rounded-lg text-sl text-center focus:outline-none"
                value={filterValue[1] ?? ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: [number | undefined, number | undefined] | undefined) => [
                        old?.[0],
                        val ? parseFloat(val) : undefined,
                    ]);
                }}
                placeholder={`Máx(${facetedMax.toFixed(1)})`}
                style={{ width: "70px", marginLeft: "0.5rem" }}
            />
        </div>
    );
}

export function SelectColumnFilter({ column }: { column: any }) {
    const filterValue = column.getFilterValue() as string | undefined;
    const options = React.useMemo(() => {
        const values = column.getFacetedUniqueValues?.() as Map<any, number> | undefined;
        return values ? Array.from(values.keys()) : [];
    }, [column]);

    return (
        <select
            className="my-2 w-full text-gray-600 border-2 border-gray-300 bg-white h-10 px-2 rounded-lg text-sm focus:outline-none"
            value={filterValue ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
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
