"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { DataTable } from "@/components/dynamic-data-table/data-table";
import { getPaymentColumns } from "@/components/payments/payment-columns";
import type { Database } from "@/types/supabase";
import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table";
import { getPayments } from "@/app/actions/payments";
import { format } from "date-fns";

type Payment = Database["public"]["Tables"]["payments"]["Row"];

interface PaymentsClientProps {
  initialPayments: Payment[];
  initialCount: number;
}

export function PaymentsClient({ initialPayments, initialCount }: PaymentsClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isPending, startTransition] = useTransition();

  const filters: any = [
    {
      key: "date",
      title: "Date",
      type: "date",
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  useEffect(() => {
    const dateFilter = columnFilters.find((filter) => filter.id === "date");
    let dateRange: { from?: string; to?: string } | undefined;
    
    if (dateFilter && dateFilter.value) {
      const range = dateFilter.value as { from?: string; to?: string };
      
      if (range.from && range.to) {
        dateRange = {
          from: format(new Date(range.from), "yyyy-MM-dd"),
          to: format(new Date(range.to), "yyyy-MM-dd"),
        };
      }
    }

    startTransition(async () => {
      const result = await getPayments({
        dateRange,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      
      if (result.data) {
        setPayments(result.data);
        setTotalCount(result.count);
      }
    });
  }, [columnFilters, pagination.pageIndex, pagination.pageSize]);

  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    
    return payments.filter((payment) => {
      const searchLower = search.toLowerCase();
      return (
        payment.amount.toString().includes(searchLower) ||
        payment.payment_from?.toLowerCase().includes(searchLower) ||
        payment.date.toLowerCase().includes(searchLower)
      );
    });
  }, [payments, search]);

  const handleDeleteOptimistic = (paymentId: string) => {
    // Immediately remove from UI
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    setTotalCount((prev) => prev - 1);
  };

  const columns = useMemo(() => getPaymentColumns(handleDeleteOptimistic), []);

  return (
    <DataTable
      columns={columns}
      data={filteredPayments}
      filters={filters}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      search={search}
      onSearch={setSearch}
      showTableHeader={true}
      searchPlaceholder="Search payments..."
      tableLoading={isPending}
      pageInfo={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
    />
  );
}

