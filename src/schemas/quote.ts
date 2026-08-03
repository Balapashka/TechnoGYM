import { z } from "zod";

/**
 * Digits-and-plus form of a typed phone number: spaces, brackets, hyphens and
 * dots are dropped and only a leading "+" survives, so "+7 (999) 123-45-67"
 * and "8 999 123 45 67" both normalize to something storable.
 */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/**
 * What a visitor may type: digits, an optional leading "+" and the usual
 * separators. Checked before normalization so "+7 999 123 45 67 доб. 12" is
 * rejected instead of silently becoming a different number.
 */
const PHONE_INPUT_PATTERN = /^\+?[\d\s().-]+$/;

/**
 * RU/CIS numbers are 10 digits without a country code ("9991234567") and 11–15
 * with one; the upper bound is the E.164 maximum.
 */
const PHONE_PATTERN = /^\+?\d{10,15}$/;

export const PHONE_ERROR_MESSAGE = "Введите корректный номер телефона";

/**
 * A "price on request" lead. Products imported to order (`priceOnRequest`)
 * never show a price, so this is the only way a visitor can ask for one.
 */
export const quoteRequestSchema = z.object({
  // The product may have been removed by the time the form is submitted, so the
  // id is optional and the name below is what makes the lead readable.
  productId: z.string().trim().optional(),
  productName: z.string().trim().min(1, "Не удалось определить товар"),
  name: z.string().trim().min(2, "Укажите ваше имя"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_INPUT_PATTERN, PHONE_ERROR_MESSAGE)
    .transform(normalizePhone)
    .pipe(z.string().regex(PHONE_PATTERN, PHONE_ERROR_MESSAGE)),
  // Optional: an empty field parses to `undefined` instead of failing the
  // email check.
  email: z
    .string()
    .trim()
    .transform((v) => (v.length > 0 ? v : undefined))
    .pipe(z.email("Введите корректный email").optional())
    .optional(),
  comment: z
    .string()
    .trim()
    .max(1000, "Комментарий — не более 1000 символов")
    .transform((v) => (v.length > 0 ? v : undefined))
    .optional(),
});

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequestOutput = z.output<typeof quoteRequestSchema>;
