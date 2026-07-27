import { z } from "zod";
import { BASE_CURRENCY } from "@/lib/format";
import { expiryInFuture, luhnValid } from "@/lib/card";

/**
 * Countries a checkout can ship to — must stay in sync with `COUNTRIES` in
 * `src/store/locale-store.ts` (asserted by `checkout.test.ts`). Kept here as a
 * plain list so the server-side payload validation doesn't import the client
 * store.
 */
export const CHECKOUT_COUNTRY_CODES = ["RU", "KZ", "UZ", "KG"] as const;

export type CheckoutCountryCode = (typeof CHECKOUT_COUNTRY_CODES)[number];

/**
 * Postal-code format per country. RU/UZ/KG use a 6-digit index; KZ also has
 * the newer alphanumeric format (e.g. "A10A5T4") alongside the legacy digits.
 */
export const POSTAL_CODE_RULES: Record<
  CheckoutCountryCode,
  { pattern: RegExp; hint: string; message: string }
> = {
  RU: { pattern: /^\d{6}$/, hint: "123456", message: "Индекс — 6 цифр" },
  KZ: {
    pattern: /^(\d{6}|[A-Za-z]\d{2}[A-Za-z]\d[A-Za-z]\d)$/,
    hint: "010000 или A10A5T4",
    message: "Индекс — 6 цифр или формат A10A5T4",
  },
  UZ: { pattern: /^\d{6}$/, hint: "100000", message: "Индекс — 6 цифр" },
  KG: { pattern: /^\d{6}$/, hint: "720000", message: "Индекс — 6 цифр" },
};

/** Letters (Cyrillic or Latin) joined by single spaces, hyphens or apostrophes. */
const NAME_PATTERN =
  /^[A-Za-zА-Яа-яЁё]+(?:[ '-][A-Za-zА-Яа-яЁё]+)*$/;

export const checkoutSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Укажите email")
      .pipe(z.email("Введите корректный email")),
    fullName: z
      .string()
      .trim()
      .min(1, "Укажите имя и фамилию")
      .regex(NAME_PATTERN, "Только буквы, пробелы и дефис")
      .refine(
        (v) => v.split(/\s+/).length >= 2,
        "Укажите имя и фамилию через пробел",
      ),
    address: z.string().trim().min(5, "Адрес — минимум 5 символов"),
    city: z
      .string()
      .trim()
      .min(2, "Укажите город")
      .regex(NAME_PATTERN, "Только буквы, пробелы и дефис"),
    postalCode: z.string().trim().min(1, "Укажите почтовый индекс"),
    country: z.enum(CHECKOUT_COUNTRY_CODES, { message: "Выберите страну" }),
    // Fake card details — demo only, never stored (see /api/checkout).
    cardName: z
      .string()
      .trim()
      .min(2, "Укажите имя на карте")
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Только латинские буквы и пробелы",
      )
      .transform((s) => s.toUpperCase()),
    cardNumber: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(
        z
          .string()
          .regex(/^\d{16}$/, "Введите 16 цифр номера карты")
          .refine(luhnValid, "Проверьте номер карты"),
      ),
    cardExpiry: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Формат ММ/ГГ")
      .refine((v) => expiryInFuture(v), "Срок действия карты истёк"),
    cardCvc: z.string().regex(/^\d{3,4}$/, "3–4 цифры"),
  })
  .superRefine((data, ctx) => {
    const rule = POSTAL_CODE_RULES[data.country];
    if (rule && !rule.pattern.test(data.postalCode)) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: rule.message,
      });
    }
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutOutput = z.output<typeof checkoutSchema>;

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
