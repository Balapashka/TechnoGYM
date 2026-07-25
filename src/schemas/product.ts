import { z } from "zod";

/** Admin product form. Price is entered in whole euros, stored as cents. */
export const productSchema = z.object({
  name: z.string().min(2, "Enter a product name"),
  slug: z
    .string()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().min(10, "Enter a description (min 10 chars)"),
  priceEuros: z.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Pick a category"),
  badge: z.string().max(20).optional().or(z.literal("")),
  features: z.string().optional().or(z.literal("")), // newline-separated
  inStock: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name"),
  slug: z
    .string()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
