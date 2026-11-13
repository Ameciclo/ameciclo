import type { RowData } from "@tanstack/react-table";
import type { ColumnFilterProps, TableRowOf } from "./features";

// Lowercase and strip accents, so "amelia" finds "R. Amélia".
const plain = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export type NumberRange = [number | undefined, number | undefined];

const asNumber = (value: unknown) => (typeof value === "number" ? value : undefined);

// Filter values of range columns are `[min, max]` pairs; anything else means "no range".
export function asRange(filterValue: unknown): NumberRange {
    return Array.isArray(filterValue) ? [asNumber(filterValue[0]), asNumber(filterValue[1])] : [undefined, undefined];
}

// Text filter that matches anywhere in the value, ignoring case and accents.
export function containsText<TData extends RowData>(row: TableRowOf<TData>, columnId: string, filterValue: unknown) {
    const wanted = plain(String(filterValue).trim());
    return plain(String(row.getValue(columnId) ?? "")).includes(wanted);
}
containsText.autoRemove = (value: unknown) => !value;

// Default text filter: the value starts with what was typed, ignoring case.
export function startsWithText<TData extends RowData>(row: TableRowOf<TData>, columnId: string, filterValue: unknown) {
    const value = row.getValue(columnId);
    return value !== undefined ? String(value).toLowerCase().startsWith(String(filterValue).toLowerCase()) : true;
}
startsWithText.autoRemove = (value: unknown) => !value;

// Keeps rows with a value inside the (open ended) range.
export function numberRangeFilterFn<TData extends RowData>(row: TableRowOf<TData>, columnId: string, filterValue: unknown) {
    const [min, max] = asRange(filterValue);
    const rowValue = row.getValue(columnId);
    return (
        (min === undefined || Number(rowValue) >= min) &&
        (max === undefined || Number(rowValue) <= max)
    );
}
numberRangeFilterFn.autoRemove = (value: unknown) => {
    const [min, max] = asRange(value);
    return !min && !max;
};

// Inclusive range where a missing bound is open and swapped bounds are put in order.
export function between<TData extends RowData>(row: TableRowOf<TData>, columnId: string, filterValue: unknown) {
    const [unsafeMin, unsafeMax] = asRange(filterValue);
    const first = unsafeMin ?? -Infinity;
    const second = unsafeMax ?? Infinity;
    const min = Math.min(first, second);
    const max = Math.max(first, second);
    const rowValue = Number(row.getValue(columnId));
    return rowValue >= min && rowValue <= max;
}
between.autoRemove = (value: unknown) => {
    const [min, max] = asRange(value);
    return !value || (min === undefined && max === undefined);
};

export function filterGreaterThan<TData extends RowData>(row: TableRowOf<TData>, columnId: string, filterValue: unknown) {
    return Number(row.getValue(columnId)) >= Number(filterValue);
}
filterGreaterThan.autoRemove = (value: unknown) => typeof value !== "number";

export function ColumnFilter<TData extends RowData>({ column, placeholder = "Buscar" }: ColumnFilterProps<TData> & { placeholder?: string }) {
    const filterValue = column.getFilterValue();
    return (
        <>
            <input
                className="my-2 w-full text-gray-600 border-2 border-gray-300 bg-white h-10 px-4 rounded-lg text-sm focus:outline-hidden"
                type="text"
                placeholder={placeholder}
                value={typeof filterValue === "string" ? filterValue : ""}
                onChange={(e) => {
                    column.setFilterValue(e.target.value || undefined);
                }}
            />
        </>
    );
}

export function NumberRangeColumnFilter<TData extends RowData>({ column, rows }: ColumnFilterProps<TData>) {
    const [filterMin, filterMax] = asRange(column.getFilterValue());
    const values = rows.map((row) => Number(row.getValue(column.id)));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;

    return (
        <div
            style={{
                display: "flex",
            }}
        >
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 rounded-lg text-sl text-center focus:outline-hidden"
                value={filterMin || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [val ? parseFloat(val) : undefined, asRange(old)[1]]);
                }}
                placeholder={`Mín(${min.toFixed(1)})`}
                style={{
                    width: "70px",
                    marginRight: "0.5rem",
                }}
            />
            <div className="my-5 max-w-sm text-gray-600  text-sl text-center">a</div>
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 rounded-lg text-sl text-center focus:outline-hidden"
                value={filterMax || ""}
                type="number"
                onChange={(e) => {
                    const val = e.target.value;
                    column.setFilterValue((old: unknown) => [asRange(old)[0], val ? parseFloat(val) : undefined]);
                }}
                placeholder={`Máx(${max.toFixed(1)})`}
                style={{
                    width: "70px",
                    marginLeft: "0.5rem",
                }}
            />
        </div>
    );
}

export function SelectColumnFilter<TData extends RowData>({ column, rows }: ColumnFilterProps<TData>) {
    const filterValue = column.getFilterValue();
    const options = Array.from(new Set(rows.map((row) => String(row.getValue(column.id)))));

    return (
        <select
            className="my-2 w-full text-gray-600 border-2 border-gray-300 bg-white h-10 px-2 rounded-lg text-sm focus:outline-hidden"
            value={typeof filterValue === "string" ? filterValue : ""}
            onChange={(e) => {
                column.setFilterValue(e.target.value || undefined);
            }}
        >
            <option value="">Todos tipos</option>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}
