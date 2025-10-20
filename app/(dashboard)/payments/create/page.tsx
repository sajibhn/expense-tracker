import { PaymentForm } from "@/components/payments/payment-form";

export default function CreatePaymentPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Payment</h1>
        <p className="text-gray-600">Add a new payment record</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <PaymentForm mode="create" />
      </div>
    </div>
  );
}

