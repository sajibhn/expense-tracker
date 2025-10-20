import { Skeleton } from "../ui/skeleton";

export function TableSkeleton({ onlyTable = false }: { onlyTable?: boolean }) {
  if (onlyTable) {
    return (
      <div className="space-y-4">
        <TableRowSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Skeleton */}
      <Skeleton className="h-6 w-1/3" />
      <TableRowSkeleton />
    </div>
  );
}

const TableRowSkeleton = () => {
  return (
    <>
      {/* Filters Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_100px] gap-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-10" />
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: 10 }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_100px] items-center gap-4"
        >
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </>
  );
};
