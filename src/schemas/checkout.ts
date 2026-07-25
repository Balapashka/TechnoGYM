import { z } from "zod";
import { BASE_CURRENCY } from "@/lib/format";

export const checkoutSchema = z.object({
  email: z.string().min(1, "Укажите email").email("Введите корректный email"),
  fullName: z.string().min(2, "Укажите имя и фамилию"),
  address: z.string().min(5, "Укажите адрес"),
  city: z.string().min(2, "Укажите город"),
  postalCode: z
    .string()
    .min(3, "Укажите почтовый индекс")
    .max(12, "Слишком длинный индекс"),
  country: z.string().min(2, "Выберите страну"),
  // Fake card details — demo only, never sent anywhere or stored.
  cardName: z.string().min(2, "Укажите имя на карте"),
  cardNumber: z
    .string()
    .transform((s) => s.replace(/\s+/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{16}$/, "Введите 16 цифр номера карты"),
    ),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Формат ММ/ГГ"),
  cardCvc: z.string().regex(/^\d{3,4}$/, "3–4 цифры"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** A cart line as sent to the checkout endpoint. */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable(),
  name: z.string().min(1),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutPayloadSchema = z.object({
  customer: checkoutSchema,
  items: z.array(checkoutItemSchema).min(1, "Корзина пуста"),
  currency: z.string().default(BASE_CURRENCY),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
