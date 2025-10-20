import { ExpenseForm } from "@/components/expenses/expense-form";
import { getCategories } from "@/app/actions/categories";

export default async function CreateExpensePage() {
  const { data: categories } = await getCategories();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Expense</h1>
        <p className="text-gray-600">Add a new expense record</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <ExpenseForm mode="create" categories={categories || []} />
      </div>
    </div>
  );
}

