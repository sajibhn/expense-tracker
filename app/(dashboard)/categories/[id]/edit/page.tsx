import { CategoryForm } from "@/components/categories/category-form";
import { getCategoryById } from "@/app/actions/categories";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { data: category, error } = await getCategoryById(params.id);

  if (error || !category) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-gray-600">Update category information</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <CategoryForm mode="edit" category={category} />
      </div>
    </div>
  );
}

