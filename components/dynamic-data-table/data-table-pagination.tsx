import type { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  // Read pagination state safely (table may be used without pagination)
  const paginationState = (table.getState() as any)?.pagination as
    | { pageIndex: number; pageSize: number }
    | undefined;

  const hasPagination = !!paginationState;

  // Counts
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const pageCount = hasPagination ? table.getPageCount() : 1;
  const pageIndex = hasPagination ? paginationState!.pageIndex : 0;
  const pageSize = hasPagination ? paginationState!.pageSize : totalRows;

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  const maxButtons = 5;
  const totalPages = pageCount;

  function getWindow(): number[] {
    if (!hasPagination) return [1];

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const current = pageIndex + 1;
    let startPage = current - Math.floor(maxButtons / 2);
    let endPage = current + Math.floor(maxButtons / 2);

    if (startPage < 1) {
      startPage = 1;
      endPage = maxButtons;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - (maxButtons - 1);
    }

    const windowPages: number[] = [];
    for (let p = startPage; p <= endPage; p++) windowPages.push(p);
    return windowPages;
  }

  const windowPages = getWindow();

  return (
    <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        {hasPagination ? (
          totalRows === 0 ? (
            <>Showing 0 results</>
          ) : (
            <>
              Showing {start.toLocaleString()} to {end.toLocaleString()} of{" "}
              {totalRows.toLocaleString()}
            </>
          )
        ) : (
          <>Showing {totalRows.toLocaleString()} rows</>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Pager (Previous | numbered buttons | Next) */}
        {hasPagination && totalRows > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {windowPages.map((p) => {
                const isActive = p === pageIndex + 1;
                return (
                  <Button
                    key={p}
                    variant={isActive ? "secondary" : "outline"}
                    className={isActive ? "bg-accent" : ""}
                    size="sm"
                    onClick={() => table.setPageIndex(p - 1)}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
