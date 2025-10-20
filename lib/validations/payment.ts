import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return selectedDate <= today;
    }, "Date cannot be in the future"),
  payment_from: z.string().optional().or(z.literal("")),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

