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
import { deletePayment } from "@/app/actions/payments";
import { useState } from "react";
import { format } from "date-fns";

type Payment = Database["public"]["Tables"]["payments"]["Row"];

function DeletePaymentDialog({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePayment(payment.id);
    
    if (result.error) {
      alert(`Error deleting payment: ${result.error}`);
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
          <DialogTitle>Delete Payment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this payment of ${payment.amount}?
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

export const paymentColumns: ColumnDef<Payment>[] = [
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
    accessorKey: "payment_from",
    header: "Payment From",
    cell: ({ row }) => {
      const paymentFrom = row.getValue("payment_from") as string | null;
      return <div>{paymentFrom || "-"}</div>;
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{format(date, "d MMMM yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            onClick={() => router.push(`/payments/${payment.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DeletePaymentDialog payment={payment} />
        </div>
      );
    },
  },
];

