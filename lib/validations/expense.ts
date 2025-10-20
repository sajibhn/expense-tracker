import { z } from "zod";

export const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required").max(100, "Name is too long"),
  category_id: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return selectedDate <= today;
    }, "Date cannot be in the future"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

