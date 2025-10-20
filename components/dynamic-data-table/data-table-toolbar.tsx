"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import DataTableFilterParser from "./data-table-filter-parser";
import type{
  TableFilters,
} from "./data-table-filter-parser";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onSearch: (search: string) => void;
  search: string;
  tableLoading?: boolean;
  searchPlaceholder?: string;
  filters?: TableFilters;
  showViewToggle?: boolean;
  showSearchInput?: boolean;
  customFilters?: React.ReactNode;
  tableHeaderClassNames?: string;
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  search,
  tableLoading,
  searchPlaceholder = "Search by title",
  filters = [],
  showSearchInput = true,
  customFilters,
  tableHeaderClassNames = "",
}: DataTableToolbarProps<TData>) {

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        tableHeaderClassNames,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showSearchInput && (
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                onSearch(value); // Pass search value to TaskPage
              }}
              className="h-8 w-[150px] pr-5 lg:w-[250px]"
            />
            {tableLoading && (
              <Loader2 className="absolute right-2 top-2 size-4 animate-spin" />
            )}
          </div>
        )}
        <DataTableFilterParser table={table} filters={filters} />
      </div>
      <div className="flex gap-2">
        {customFilters}
      </div>
    </div>
  );
}
