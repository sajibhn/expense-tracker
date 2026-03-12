"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryComboboxProps {
  categories: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const trimmedSearch = search.trim();
  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === trimmedSearch.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || "Select or create category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search or type new category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2 text-sm text-muted-foreground">
              {trimmedSearch ? (
                <button
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onChange(trimmedSearch);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create &quot;{trimmedSearch}&quot;
                </button>
              ) : (
                "No categories found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.toLowerCase() === category.name.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
              {trimmedSearch && !exactMatch && categories.length > 0 && (
                <CommandItem
                  value={`create-${trimmedSearch}`}
                  onSelect={() => {
                    onChange(trimmedSearch);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{trimmedSearch}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
