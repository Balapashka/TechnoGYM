import { z } from "zod";
import { BASE_CURRENCY } from "@/lib/format";
import { CITY_PATTERN, CITY_ERROR_MESSAGE, normalizeCity } from "@/lib/city";
import { emailField } from "@/schemas/auth";
import {
  normalizePhone,
  PHONE_ERROR_MESSAGE,
  PHONE_INPUT_PATTERN,
  PHONE_PATTERN,
} from "@/schemas/quote";

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

/** Shared phone rules (same as the price-request form). */
const phoneField = z
  .string()
  .trim()
  .min(1, PHONE_ERROR_MESSAGE)
  .regex(PHONE_INPUT_PATTERN, PHONE_ERROR_MESSAGE)
  .transform(normalizePhone)
  .pipe(z.string().regex(PHONE_PATTERN, PHONE_ERROR_MESSAGE));

export const DELIVERY_METHODS = ["delivery", "pickup"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

/**
 * "manual": the order is placed without payment; a manager confirms stock,
 * delivery cost and sends a payment link / invoice. "online": pay by card on
 * ЮKassa's page right after checkout (only offered when ЮKassa is configured).
 * Card details are never entered on this site.
 */
export const PAYMENT_METHODS = ["manual", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const checkoutSchema = z
  .object({
    email: emailField,
    fullName: z
      .string()
      .trim()
      .min(1, "Укажите имя и фамилию")
      .max(100, "Слишком длинное имя")
      .regex(NAME_PATTERN, "Только буквы, пробелы и дефис")
      .refine(
        (v) => v.split(/\s+/).length >= 2,
        "Укажите имя и фамилию через пробел",
      ),
    phone: phoneField,
    deliveryMethod: z.enum(DELIVERY_METHODS),
    country: z.enum(CHECKOUT_COUNTRY_CODES, { message: "Выберите страну" }),
    // Address fields are required for delivery only (see superRefine below);
    // for pickup they may stay empty.
    city: z.string().max(100).transform(normalizeCity),
    address: z.string().trim().max(300, "Слишком длинный адрес"),
    postalCode: z.string().trim().max(10),
    comment: z
      .string()
      .trim()
      .max(1000, "Комментарий — не более 1000 символов")
      .optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    consent: z.literal(true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "delivery") return;

    if (data.city.length < 2) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Укажите город" });
    } else if (!CITY_PATTERN.test(data.city)) {
      ctx.addIssue({ code: "custom", path: ["city"], message: CITY_ERROR_MESSAGE });
    }

    if (data.address.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Укажите улицу, дом и квартиру/офис",
      });
    }

    // The postal code is optional (many people do not know theirs), but a
    // value that is entered must match the country's format.
    const rule = POSTAL_CODE_RULES[data.country];
    if (data.postalCode && rule && !rule.pattern.test(data.postalCode)) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: rule.message,
      });
    }
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutOutput = z.output<typeof checkoutSchema>;

/**
 * A cart line as sent to the checkout endpoint.
 *
 * `name` and `unitPriceCents` are accepted for backwards compatibility but the
 * server ignores them — `buildOrder` re-reads both from the catalog, so a
 * tampered payload cannot change what an order costs.
 */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1).max(100),
  variantId: z.string().max(100).nullable(),
  name: z.string().min(1).max(300),
  unitPriceCents: z.number().int().nonnegative(),
  // Upper bound mirrors MAX_LINE_QUANTITY in src/store/cart-store.ts.
  quantity: z.number().int().positive().max(99),
});

export const checkoutPayloadSchema = z.object({
  customer: checkoutSchema,
  items: z.array(checkoutItemSchema).min(1, "Корзина пуста").max(100),
  currency: z.string().default(BASE_CURRENCY),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
