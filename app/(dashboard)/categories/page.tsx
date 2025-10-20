import { DataTable } from "@/components/dynamic-data-table/data-table";
import { categoryColumns } from "@/components/categories/category-columns";
import { getCategories } from "@/app/actions/categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function CategoriesPage() {
  const { data: categories, error } = await getCategories();

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading categories: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage your expense categories</p>
        </div>
        <Link href="/categories/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </Link>
      </div>

      <DataTable columns={categoryColumns} data={categories || []} />
    </div>
  );
}