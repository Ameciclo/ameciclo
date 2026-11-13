import "@tanstack/react-table";
import type { ColumnFilterComponent } from "~/components/Commom/Table/features";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData = CellData> {
    // Input shown under the column header when the filter panel is open.
    Filter?: ColumnFilterComponent<TData>;
  }
}
