import { z } from "zod";

/** Non-empty trimmed lines of a textarea value. */
export function splitLines(raw?: string): string[] {
  return (raw ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A same-site path (not protocol-relative) or an https URL. */
export function isImageUrl(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Admin product form. Price is entered in whole roubles, stored in kopeks. */
export const productSchema = z.object({
  name: z.string().trim().min(2, "Укажите название товара").max(200),
  slug: z
    .string()
    .min(2, "Укажите slug")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  description: z
    .string()
    .trim()
    .min(10, "Добавьте описание (минимум 10 символов)")
    .max(10000),
  priceRub: z
    .number({ message: "Укажите цену" })
    .positive("Цена должна быть больше нуля")
    .max(100_000_000, "Слишком большая цена"),
  brand: z.string().min(2, "Укажите бренд"),
  originCountry: z.string().min(2, "Укажите страну производства"),
  categoryId: z.string().min(1, "Выберите категорию"),
  badge: z.string().max(20).optional().or(z.literal("")),
  features: z.string().max(5000).optional().or(z.literal("")), // newline-separated
  /**
   * Photo URLs, one per line; the first is the main photo. Site paths
   * ("/uploads/…") and https links are accepted.
   */
  images: z
    .string()
    .max(10000)
    .optional()
    .refine(
      (v) => splitLines(v).every(isImageUrl),
      "Каждая строка — ссылка https://… или путь /uploads/…",
    ),
  inStock: z.boolean(),
  // Made-to-order imports keep their price in the database but never show it
  // in the storefront: the shopper gets a quote CTA instead.
  priceOnRequest: z.boolean(),
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
