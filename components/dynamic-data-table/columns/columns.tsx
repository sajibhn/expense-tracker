// src/components/listings/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Button } from "../../ui/button";
import { Eye } from "lucide-react";
import { DataTableColumnHeader } from "../data-table-column-header";

export type ExternalListingUrl = {
  source: string;
  url: string;
};

export const columns: ColumnDef<any>[] = [
  // View
  {
    accessorKey: "view",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="View" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Link href={""}>
            <Button variant={"link"} size={"sm"}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
    enableSorting: false,
  },
];
