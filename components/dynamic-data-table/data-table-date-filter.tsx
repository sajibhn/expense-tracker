import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Separator } from "../ui/separator";
import { convertToUTC } from "@/lib/generateMonths";

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  defaultValue?: DateRange;
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
  defaultValue,
}: DataTableDateFilterProps<TData, TValue>) {
  const [dateRange, setDateRange] = React.useState({
    ...(defaultValue?.from
      ? {
          from: convertToUTC(defaultValue?.from) as unknown as Date,
        }
      : {}),
    ...(defaultValue?.to
      ? {
          to: convertToUTC(defaultValue?.to) as unknown as Date,
        }
      : {}),
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    const utcRange = {
      from: range?.from,
      to: range?.to,
    };
    setDateRange(utcRange);
    if (range?.from && range?.to) {
      column?.setFilterValue({
        from: new Date(range?.from).toDateString(),
        to: new Date(range?.to).toDateString(),
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {title}
          {dateRange?.from && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span>
                {dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange as DateRange}
          onSelect={handleDateSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
