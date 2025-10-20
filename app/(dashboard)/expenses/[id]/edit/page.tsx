import { ExpenseForm } from "@/components/expenses/expense-form";
import { getExpenseById } from "@/app/actions/expenses";
import { getCategories } from "@/app/actions/categories";
import { notFound } from "next/navigation";

interface EditExpensePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;
  
  const [expenseResult, categoriesResult] = await Promise.all([
    getExpenseById(id),
    getCategories(),
  ]);

  if (expenseResult.error || !expenseResult.data) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Expense</h1>
        <p className="text-gray-600">Update expense information</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <ExpenseForm
          mode="edit"
          expense={expenseResult.data}
          categories={categoriesResult.data || []}
        />
      </div>
    </div>
  );
}

