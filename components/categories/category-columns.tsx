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
import { deleteCategory } from "@/app/actions/categories";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";

type Category = Database["public"]["Tables"]["categories"]["Row"];

function DeleteCategoryDialog({ category }: { category: Category }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpen(false);
    
    const result = await deleteCategory(category.id);
    
    if (result.error) {
      alert(`Error deleting category: ${result.error}`);
      setIsDeleting(false);
    } else {
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the category &quot;{category.name}&quot;?
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

export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "thumbnail_url",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnailUrl = row.getValue("thumbnail_url") as string | null;
      
      if (!thumbnailUrl) {
        return (
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-xs text-gray-400">No img</span>
          </div>
        );
      }

      return (
        <div className="w-10 h-10 relative rounded overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt="Category thumbnail"
            fill
            className="object-cover"
          />
        </div>
      );
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
    cell: ({ row }) => <CategoryActions category={row.original} />,
  },
];

function CategoryActions({ category }: { category: Category }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        className="h-8 w-8"
        onClick={() => router.push(`/categories/${category.id}/edit`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteCategoryDialog category={category} />
    </div>
  );
}

