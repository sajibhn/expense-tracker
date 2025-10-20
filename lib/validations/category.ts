import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name is too long"),
  thumbnail_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

