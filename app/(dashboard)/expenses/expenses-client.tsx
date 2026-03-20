"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { DataTable } from "@/components/dynamic-data-table/data-table";
import { getExpenseColumns } from "@/components/expenses/expense-columns";
import type { Database } from "@/types/supabase";
import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table";
import { getExpenses } from "@/app/actions/expenses";
import { format } from "date-fns";

type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  category?: { id: string; name: string } | null;
};

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface ExpensesClientProps {
  initialExpenses: Expense[];
  initialCount: number;
  categories: Category[];
  initialCategoryId?: string;
}

export function ExpensesClient({ initialExpenses, initialCount, categories, initialCategoryId }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialCategoryId ? [{ id: "category", value: [initialCategoryId] }] : []
  );
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isPending, startTransition] = useTransition();

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const filters: any = [
    {
      key: "category",
      title: "Category",
      type: "multiselect",
      options: categoryOptions,
    },
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

    const categoryFilter = columnFilters.find((filter) => filter.id === "category");
    const categoryIds = categoryFilter?.value as string[] | undefined;

    startTransition(async () => {
      const result = await getExpenses({
        dateRange,
        categoryIds: categoryIds?.length ? categoryIds : undefined,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      
      if (result.data) {
        setExpenses(result.data as Expense[]);
        setTotalCount(result.count);
      }
    });
  }, [columnFilters, pagination.pageIndex, pagination.pageSize]);

  const filteredExpenses = useMemo(() => {
    if (!search) return expenses;
    
    return expenses.filter((expense) => {
      const searchLower = search.toLowerCase();
      return (
        expense.name.toLowerCase().includes(searchLower) ||
        expense.amount.toString().includes(searchLower) ||
        expense.category?.name?.toLowerCase().includes(searchLower) ||
        expense.date.toLowerCase().includes(searchLower)
      );
    });
  }, [expenses, search]);

  const handleDeleteOptimistic = (expenseId: string) => {
    // Immediately remove from UI
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    setTotalCount((prev) => prev - 1);
  };

  const columns = useMemo(() => getExpenseColumns(handleDeleteOptimistic), []);

  return (
    <DataTable
      columns={columns}
      data={filteredExpenses}
      filters={filters}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      search={search}
      onSearch={setSearch}
      showTableHeader={true}
      searchPlaceholder="Search expenses..."
      tableLoading={isPending}
      pageInfo={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
    />
  );
}

