import type { Table } from "@tanstack/react-table";
import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface Props<TData> {
  table: Table<TData>;
  filters: any;
};

function DataTableFilterParser<TData>({ table, filters = [] }: Props<TData>) {
  return (
    <>
      {filters.map((filter: any) => {
        if (filter.type === "multiselect") {
          return (
            <DataTableFacetedFilter
              key={filter.key}
              column={table.getColumn(filter.key)}
              title={filter.title}
              options={filter.options}
            />
          );
        }
        if (filter.type === "select") {
          return (
            <DataTableFacetedFilter
              selectionMode="single"
              key={filter.key}
              column={table.getColumn(filter.key)}
              title={filter.title}
              options={filter.options}
            />
          );
        }
        if (filter.type === "date") {
          return (
            <DataTableDateFilter
              key={filter.key}
              column={table.getColumn(filter.key)}
              title={filter.title}
              defaultValue={filter.defaultValue}
            />
          );
        }
      })}
    </>
  );
}

export default DataTableFilterParser;

export type TableFilters = {
  key: string;
  title: string;
  type: string;
  options: { value: string; label: string }[];
}[];
