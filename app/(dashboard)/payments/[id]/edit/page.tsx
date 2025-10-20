import { PaymentForm } from "@/components/payments/payment-form";
import { getPaymentById } from "@/app/actions/payments";
import { notFound } from "next/navigation";

interface EditPaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const { id } = await params;
  const { data: payment, error } = await getPaymentById(id);

  if (error || !payment) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Payment</h1>
        <p className="text-gray-600">Update payment information</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <PaymentForm mode="edit" payment={payment} />
      </div>
    </div>
  );
}

