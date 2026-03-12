import { z } from "zod";

export const vocabularySchema = z.object({
  german: z.string().min(1, "German word is required").max(200, "Too long"),
  english: z.string().min(1, "English word is required").max(200, "Too long"),
  category_name: z.string().optional(),
});

export type VocabularyFormData = z.infer<typeof vocabularySchema>;
