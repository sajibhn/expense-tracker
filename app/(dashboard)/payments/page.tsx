import { getPayments } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PaymentsClient } from "./payments-client";

export default async function PaymentsPage() {
  const { data: payments, error, count } = await getPayments({
    page: 0,
    pageSize: 10,
  });

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading payments: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-600">Manage your payments</p>
        </div>
        <Link href="/payments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Payment
          </Button>
        </Link>
      </div>

      <PaymentsClient initialPayments={payments || []} initialCount={count} />
    </div>
  );
}