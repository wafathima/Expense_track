import { z } from "zod";

export const createExpenseSchema = z.object({
  user_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  payment_method_id: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().default(""),
  amount: z.number().positive("Amount must be greater than 0"),
  expense_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateExpenseSchema = createExpenseSchema.partial();