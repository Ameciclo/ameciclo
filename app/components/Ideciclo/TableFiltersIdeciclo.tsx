import React from "react";
import { useAsyncDebounce } from "react-table";

export const ColumnFilter = ({ column }: any) => {
    const { filterValue, setFilter } = column;
    return (
        <>
            <input
                className="my-2 max-w-sm text-gray-600 bg-white h-10 px-4 rounded-xl text-sm focus:outline-none"
                type="search"
                name="search"
                placeholder="Buscar"
                value={filterValue || ""}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                    background: "#E5E8E9",
                }}
            />
        </>
    );
};

export function NumberRangeColumnFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id },
}: any) {
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
        <div
            style={{
                display: "flex",
            }}
        >
            <input
                className="my-2 max-w-sm text-gray-600 bg-gray-300 h-10 rounded-xl text-sl text-center focus:outline-none"
                value={filterValue[0] || ""}
                type="number"
                onChange={(e) => {
                    let val = e.target.value;
                    setFilter((old = []) => {
                        if (parseFloat(val) < min) val = "" + min;
                        if (parseFloat(val) > max) val = "" + max;
                        return [val ? parseFloat(val) : undefined, old[1]];
                    });
                }}
                placeholder={`Mín(${min.toFixed(1)})`}
                style={{
                    width: "70px",
                    marginRight: "0.5rem",
                    background: "#E5E8E9",
                }}
            />
            <div className="my-5 max-w-sm text-gray-600  text-sl text-center">a</div>
            <input
                className="my-2 max-w-sm text-gray-600 bg-gray-300 h-10 rounded-xl text-sl text-center focus:outline-none"
                value={filterValue[1] || ""}
                type="number"
                onChange={(e) => {
                    let val = e.target.value;
                    setFilter((old = []) => {
                        if (parseFloat(val) < min) val = "" + min;
                        if (parseFloat(val) > max) val = "" + max;
                        return [old[0], val ? parseFloat(val) : undefined];
                    });
                }}
                placeholder={`Máx(${max.toFixed(1)})`}
                style={{
                    width: "70px",
                    marginLeft: "0.5rem",
                    background: "#E5E8E9",
                }}
            />
        </div>
    );
}

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
            className="my-2 max-w-sm text-gray-600 bg-gray-300 h-10 px-5 pr-16 rounded-xl text-sm focus:outline-none"
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
            ))
            }
        </select>
    );
}
