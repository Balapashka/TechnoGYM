import { z } from "zod";

/** Admin product form. Price is entered in whole roubles, stored in kopeks. */
export const productSchema = z.object({
  name: z.string().min(2, "Укажите название товара"),
  slug: z
    .string()
    .min(2, "Укажите slug")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  description: z.string().min(10, "Добавьте описание (минимум 10 символов)"),
  priceRub: z.number().positive("Цена должна быть больше нуля"),
  brand: z.string().min(2, "Укажите бренд"),
  originCountry: z.string().min(2, "Укажите страну производства"),
  categoryId: z.string().min(1, "Выберите категорию"),
  badge: z.string().max(20).optional().or(z.literal("")),
  features: z.string().optional().or(z.literal("")), // newline-separated
  inStock: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Укажите название категории"),
  slug: z
    .string()
    .min(2, "Укажите slug")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
