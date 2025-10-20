"use client";

import { useState, useEffect, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getDashboardData } from "@/app/actions/dashboard";
import type { DateRange } from "react-day-picker";

interface CategorySummary {
  id: string;
  name: string;
  thumbnail_url: string | null;
  total: number;
}

interface DashboardData {
  categorySummary: CategorySummary[];
  totalPayments: number;
  paymentsCount: number;
}

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>(initialData.categorySummary);
  const [totalPayments, setTotalPayments] = useState(initialData.totalPayments);
  const [paymentsCount, setPaymentsCount] = useState(initialData.paymentsCount);
  const [isPending, startTransition] = useTransition();
  
  // Default date range: start of current month to today
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
  });

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");
      
      startTransition(async () => {
        const result = await getDashboardData({ from: fromDate, to: toDate });
        if (result.data) {
          setCategorySummary(result.data.categorySummary);
          setTotalPayments(result.data.totalPayments);
          setPaymentsCount(result.data.paymentsCount);
        }
      });
    }
  }, [dateRange]);

  const totalExpenses = categorySummary.reduce((sum, cat) => sum + cat.total, 0);
  
  const daysDifference = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0;

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Expenses by Category</h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              {dateRange?.from && dateRange?.to && (
                <>
                  {format(dateRange.from, "d MMMM yyyy")} - {format(dateRange.to, "d MMMM yyyy")}
                </>
              )}
            </p>
            {daysDifference > 0 && (
              <p className="text-sm text-gray-500">
                ({daysDifference} {daysDifference === 1 ? "day" : "days"})
              </p>
            )}
          </div>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from && dateRange?.to ? (
                <>
                  {format(dateRange.from, "d MMM")} - {format(dateRange.to, "d MMM yyyy")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Total Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Total Expenses</h3>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat("en-US", {
              maximumFractionDigits: 0,
            }).format(totalExpenses)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Total Payments</h3>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat("en-US", {
              maximumFractionDigits: 0,
            }).format(totalPayments)}
          </p>
          <p className="text-green-100 mt-2">
            {paymentsCount} {paymentsCount === 1 ? "payment" : "payments"}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Category Cards */}
      {!isPending && (
        <>
          {categorySummary.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No expenses found for this period</p>
              <p className="text-sm text-gray-400 mt-2">
                Create an expense to see it here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySummary.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Category Thumbnail */}
                    <div className="flex-shrink-0">
                      {category.thumbnail_url ? (
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                          <Image
                            src={category.thumbnail_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {new Intl.NumberFormat("en-US", {
                          maximumFractionDigits: 0,
                        }).format(category.total)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

