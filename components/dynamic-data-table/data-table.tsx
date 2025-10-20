"use client";

import * as React from "react";
import type {
  Column,
  ColumnDef,
  InitialTableState,
  PaginationState,
  RowData,
  ColumnFiltersState,
  TableMeta,
  VisibilityState,
  SortingState,
  Row,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,

} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { TableFilters } from "./data-table-filter-parser";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearch?: (search: string) => void;
  search?: string;
  pageInfo?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  pageCount?: number;
  tableLoading?: boolean;
  showTableHeader?: boolean;
  showTableFooter?: boolean;
  initialState?: InitialTableState | undefined;
  customUpdateData?: TableMeta<TData>["updateData"];
  searchPlaceholder?: string;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  filters?: TableFilters;
  columnVisibility?: VisibilityState;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  showViewToggle?: boolean;
  showSearchInput?: boolean;
  customFilters?: React.ReactNode;
  customRowHeaderClassNames?: string;
  customRowBodyClassNames?: string;
  tableWrapperClassNames?: string;
  showTable?: boolean;
  tableHeaderClassNames?: string;
  rowSelection?: string[];
  onSelectedRowsChange?: (selectedRowIds: string[]) => void;
  bulkActionBar?: React.ReactNode;
  getRowClassName?: (row: TData) => string;
}

declare module "@tanstack/react-table" {
  export interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: string,
      value: unknown,
      id: string,
    ) => Promise<void>;
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSearch,
  search,
  pageInfo,
  setPagination,
  pageCount,
  tableLoading,
  showTableHeader = true,
  showTableFooter = true,
  initialState = {},
  customUpdateData,
  searchPlaceholder,
  columnFilters,
  sorting,
  setSorting,
  setColumnFilters,
  filters = [],
  columnVisibility = {},
  setColumnVisibility,
  showViewToggle,
  showSearchInput = false,
  customFilters,
  customRowHeaderClassNames = "",
  customRowBodyClassNames = "",
  tableWrapperClassNames = "",
  showTable = true,
  tableHeaderClassNames = "",
  rowSelection: externalRowSelection,
  onSelectedRowsChange,
  bulkActionBar,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  // Convert external array format to internal Record format
  const arrayToRecord = React.useCallback((arr: string[] = []): Record<string, boolean> => {
    return arr.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  }, []);

  // Convert internal Record format to external array format
  const recordToArray = React.useCallback((record: Record<string, boolean>): string[] => {
    return Object.keys(record).filter((key) => record[key]);
  }, []);

  const [internalRowSelection, setInternalRowSelection] = React.useState<Record<string, boolean>>(() =>
    arrayToRecord(externalRowSelection)
  );

  // Update internal state when external prop changes
  React.useEffect(() => {
    if (externalRowSelection) {
      setInternalRowSelection(arrayToRecord(externalRowSelection));
    }
  }, [externalRowSelection, arrayToRecord]);

  // Wrapper to handle conversion when internal state changes
  const handleRowSelectionChange = React.useCallback((updaterOrValue: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => {
    setInternalRowSelection((prev) => {
      const newSelection = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;

      // Call the external callback with array format
      if (onSelectedRowsChange) {
        const selectedIds = recordToArray(newSelection);
        onSelectedRowsChange(selectedIds);
      }

      return newSelection;
    });
  }, [onSelectedRowsChange, recordToArray]);

  const selectionColumn = {
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        name="select-all"
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }: { row: Row<TData> }) => (
      <Checkbox
        name={`select-${row.id}`}
        label=""
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        error=""
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  };

  // Only add selection column if selection is enabled (when external rowSelection prop is passed)
  const columnsWithSelection = (externalRowSelection !== undefined
    ? [selectionColumn, ...columns]
    : columns) as ColumnDef<TData, TValue>[];

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection: internalRowSelection,
      columnFilters,
      pagination: pageInfo,
    },
    initialState,
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: setPagination,
    pageCount: pageCount,
    autoResetPageIndex: false,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    meta: {
      updateData: async (rowIndex, columnId, value, id) => {
        await customUpdateData?.(rowIndex, columnId, value, id);
      },
    },
    getRowId: (originalRow: TData) => {
      // If the row has an 'id' property, use it; otherwise fallback to string
      return (originalRow as { id?: string }).id ?? String(originalRow);
    },
  });

  //These are the important styles to make sticky column pinning work!
  //Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
  //View the index.css file for more needed styles such as border-collapse: separate
  const getCommonPinningStyles = (
    column: Column<TData, unknown>,
  ): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
      isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRightPinnedColumn =
      isPinned === "right" && column.getIsFirstColumn("right");

    return {
      boxShadow: isLastLeftPinnedColumn
        ? "-1px 0 1px -1px gray inset"
        : isFirstRightPinnedColumn
          ? "1px 0 1px -1px gray inset"
          : undefined,
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      opacity: isPinned ? 0.95 : 1,
      position: isPinned ? "sticky" : "relative",
      width: column.getSize(),
      zIndex: isPinned ? 1 : 0,
    };
  };

  const selectedRowCount = Object.keys(internalRowSelection).filter((k: string) => internalRowSelection[k]).length;

  return (
    <div className="space-y-4 font-inter">
      {bulkActionBar && selectedRowCount > 0 && (
        <div className="mb-2">{bulkActionBar}</div>
      )}
      {(showTableHeader && search && onSearch) && (
        <DataTableToolbar
          tableHeaderClassNames={tableHeaderClassNames}
          customFilters={customFilters}
          showSearchInput={showSearchInput}
          showViewToggle={showViewToggle}
          filters={filters}
          searchPlaceholder={searchPlaceholder}
          tableLoading={tableLoading}
          onSearch={onSearch}
          search={search}
          table={table}
        />
      )}
      {showTable && (
        <>
          <div
            className={cn(
              "rounded-md border overflow-auto",
              tableLoading ? "animate-pulse" : "",
              tableWrapperClassNames,
            )}
          >
            <Table className="whitespace-nowrap min-w-[800px]">
              <TableHeader className="sticky top-0 z-0">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const { column } = header;
                      return (
                        <TableHead
                          className={cn(
                            customRowHeaderClassNames,
                          )}
                          style={{ ...getCommonPinningStyles(column) }}
                          key={header.id}
                          colSpan={header.colSpan}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={getRowClassName ? getRowClassName(row.original) : ""}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const { column } = cell;
                        return (
                          <TableCell
                            className={cn(customRowBodyClassNames, "relative")}
                            style={{ ...getCommonPinningStyles(column) }}
                            key={cell.id}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {showTableFooter && <DataTablePagination table={table} />}
    </div>
  );
}
