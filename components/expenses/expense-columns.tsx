"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { deleteExpense } from "@/app/actions/expenses";
import { useState } from "react";
import { format } from "date-fns";

type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  category?: { id: string; name: string } | null;
};

function DeleteExpenseDialog({ expense }: { expense: Expense }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteExpense(expense.id);
    
    if (result.error) {
      alert(`Error deleting expense: ${result.error}`);
      setIsDeleting(false);
    } else {
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{expense.name}"?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const expenseColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return <div>{category?.name || "-"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div>{format(date, "d MMMM yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const expense = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            onClick={() => router.push(`/expenses/${expense.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteExpenseDialog expense={expense} />
        </div>
      );
    },
  },
];

