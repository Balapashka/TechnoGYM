import { z } from "zod";
import { SETTINGS_KEYS, type StoreSettings } from "@/lib/settings-shape";

const text = (max: number) => z.string().trim().max(max);

/** Admin settings form. Every field may be empty (= hidden on the site). */
export const settingsSchema = z.object({
  phone: text(40),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Введите корректный email"),
  address: text(300),
  workingHours: text(200),
  pickupAddress: text(300),
  deliveryNote: text(1000),
  legalName: text(200),
  inn: z
    .string()
    .trim()
    .refine((v) => v === "" || /^(\d{10}|\d{12})$/.test(v), "ИНН — 10 или 12 цифр"),
  ogrn: z
    .string()
    .trim()
    .refine((v) => v === "" || /^(\d{13}|\d{15})$/.test(v), "ОГРН — 13 цифр, ОГРНИП — 15"),
  legalAddress: text(300),
  telegram: text(200),
  whatsapp: text(200),
  vk: text(200),
  youtube: text(200),
}) satisfies z.ZodType<StoreSettings>;

// Compile-time guard: the schema covers exactly the known keys.
const _keys: readonly (keyof z.infer<typeof settingsSchema>)[] = SETTINGS_KEYS;
void _keys;
