import { getExpenses } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage() {
  const { data: expenses, error, count } = await getExpenses({
    page: 0,
    pageSize: 10,
  });

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading expenses: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-gray-600">Manage your expenses</p>
        </div>
        <Link href="/expenses/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Expense
          </Button>
        </Link>
      </div>

      <ExpensesClient initialExpenses={expenses || []} initialCount={count} />
    </div>
  );
}
