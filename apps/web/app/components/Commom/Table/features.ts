import {
  columnFilteringFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  type Column,
  type ColumnDef,
  type Row,
  type RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table";
import type { ComponentType } from "react";

// Features and row models shared by every table of the site. The order of the row models
// is the processing order: filter, sort, expand, paginate.
export const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export type TableFeaturesOf = typeof features;
export type TableColumn<TData extends RowData> = ColumnDef<TableFeaturesOf, TData>;
export type TableRowOf<TData extends RowData> = Row<TableFeaturesOf, TData>;

// Props of the component rendered in the filter panel under a column header.
export type ColumnFilterProps<TData extends RowData> = {
  column: Column<TableFeaturesOf, TData, unknown>;
  rows: TableRowOf<TData>[];
};
export type ColumnFilterComponent<TData extends RowData> = ComponentType<ColumnFilterProps<TData>>;

// Typed column builder: `helper.accessor("key", { header, cell })` knows the type of the value.
export function tableColumnHelper<TData extends RowData>() {
  return createColumnHelper<TableFeaturesOf, TData>();
}
