import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  fullName: z.string().min(2, "Enter your full name"),
  address: z.string().min(5, "Enter your address"),
  city: z.string().min(2, "Enter your city"),
  postalCode: z
    .string()
    .min(3, "Enter a postal code")
    .max(12, "Postal code is too long"),
  country: z.string().min(2, "Select a country"),
  // Fake card details — demo only, never sent anywhere or stored.
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z
    .string()
    .transform((s) => s.replace(/\s+/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{16}$/, "Enter the 16-digit card number"),
    ),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cardCvc: z.string().regex(/^\d{3,4}$/, "3–4 digit code"),
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
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  currency: z.string().default("EUR"),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
