import { CategoryForm } from "@/components/categories/category-form";

export default function CreateCategoryPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Category</h1>
        <p className="text-gray-600">Add a new expense category</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}

