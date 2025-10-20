import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle, ArrowUpDown, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Separator } from "../ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  selectionMode?: "multi" | "single";
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  selectionMode = "multi",
}: DataTableFacetedFilterProps<TData, TValue>) {
  const isMulti = selectionMode === "multi";
  const selectedValues = isMulti
    ? new Set(column?.getFilterValue() as string[])
    : (column?.getFilterValue() as string | undefined);

  const handleRemoveValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti) {
      const newValues = new Set(selectedValues as Set<string>);
      newValues.delete(value);
      column?.setFilterValue(
        newValues.size ? Array.from(newValues) : undefined,
      );
    } else {
      column?.setFilterValue(undefined);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    column?.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed pl-2 active:scale-100",
            isMulti
              ? (selectedValues as Set<string>)?.size
                ? "pr-1"
                : "pr-2"
              : selectedValues !== undefined
                ? "pr-1"
                : "pr-2",
          )}
        >
          {isMulti ? <PlusCircle size={14} /> : <ArrowUpDown size={14} />}
          {title}
          {isMulti
            ? (selectedValues as Set<string>)?.size > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge
                    variant={"secondary"}
                    className="rounded-sm px-2 font-normal lg:hidden"
                  >
                    {(selectedValues as Set<string>).size}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {(selectedValues as Set<string>).size > 2 ? (
                      <Badge
                        variant={"secondary"}
                        onClick={handleClearAll}
                        className="rounded-sm px-2 font-normal"
                      >
                        {(selectedValues as Set<string>).size} selected
                        <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                      </Badge>
                    ) : (
                      options
                        .filter((option) =>
                          (selectedValues as Set<string>).has(option.value),
                        )
                        .map((option) => (
                          <Badge
                            variant={"secondary"}
                            onClick={(e) => handleRemoveValue(option.value, e)}
                            key={option.value}
                            className="rounded-sm px-2 font-normal capitalize"
                          >
                            {option.label}
                            <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )
            : selectedValues?.toString() && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge
                    variant={"secondary"}
                    onClick={handleClearAll}
                    className="rounded-sm px-2 font-normal"
                  >
                    {
                      options.find((option) => option.value === selectedValues)
                        ?.label
                    }
                    <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                  </Badge>
                </>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options
                .slice()
                .sort((a, b) => a.label?.localeCompare(b.label))
                .map((option) => {
                  const isSelected = isMulti
                    ? (selectedValues as Set<string>).has(option.value)
                    : selectedValues === option.value;

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isMulti) {
                          const newValues = new Set(
                            selectedValues as Set<string>,
                          );
                          if (isSelected) {
                            newValues.delete(option.value);
                          } else {
                            newValues.add(option.value);
                          }
                          column?.setFilterValue(
                            newValues.size ? Array.from(newValues) : undefined,
                          );
                        } else {
                          column?.setFilterValue(
                            isSelected ? undefined : option.value,
                          );
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                        <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                      )}
                      <span className="capitalize">{option.label}</span>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
            {(isMulti
              ? (selectedValues as Set<string>).size > 0
              : selectedValues) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear {isMulti ? "filters" : "filter"}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { DataTableFacetedFilter };
