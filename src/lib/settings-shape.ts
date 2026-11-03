/**
 * Store settings: contacts, legal details and social links that the owner
 * edits in the admin panel (/admin/settings). Pure module — safe to import from
 * client components; the database access lives in `src/lib/settings.ts`.
 */

export type StoreSettings = {
  /** Public phone, shown in the header/footer and on the contacts page. */
  phone: string;
  /** Public email for customers. */
  email: string;
  /** Showroom / office address shown on the contacts page. */
  address: string;
  /** Working hours, free text: "Пн–Пт 10:00–19:00, Сб 11:00–17:00". */
  workingHours: string;
  /** Pickup point. Empty = pickup is not offered at checkout. */
  pickupAddress: string;
  /** Delivery terms in a sentence or two, shown at checkout and on /shipping. */
  deliveryNote: string;
  /** Seller's legal name: "ИП Иванов Иван Иванович" or "ООО «Спорт Лайнер»". */
  legalName: string;
  /** ИНН. */
  inn: string;
  /** ОГРН / ОГРНИП. */
  ogrn: string;
  /** Registered (legal) address. */
  legalAddress: string;
  /** Social / messenger links. Empty values are hidden. */
  telegram: string;
  whatsapp: string;
  vk: string;
  youtube: string;
};

export const SETTINGS_KEYS = [
  "phone",
  "email",
  "address",
  "workingHours",
  "pickupAddress",
  "deliveryNote",
  "legalName",
  "inn",
  "ogrn",
  "legalAddress",
  "telegram",
  "whatsapp",
  "vk",
  "youtube",
] as const satisfies readonly (keyof StoreSettings)[];

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

/** Values used until the owner fills the form in. Empty = hidden on the site. */
export const DEFAULT_SETTINGS: StoreSettings = {
  phone: "",
  email: "",
  address: "",
  workingHours: "Пн–Пт 10:00–19:00, Сб 11:00–17:00",
  pickupAddress: "",
  deliveryNote:
    "Доставляем по Москве и Московской области, в регионы России и страны СНГ — транспортными компаниями. Стоимость и сроки менеджер согласует при подтверждении заказа.",
  legalName: "",
  inn: "",
  ogrn: "",
  legalAddress: "",
  telegram: "",
  whatsapp: "",
  vk: "",
  youtube: "",
};

/**
 * Fields a store must publish before it may sell online in Russia (Закон
 * «О защите прав потребителей», ст. 26.1; Правила продажи товаров
 * дистанционным способом): who the seller is and how to reach them.
 */
export const REQUIRED_FOR_LAUNCH: SettingsKey[] = [
  "phone",
  "email",
  "legalName",
  "inn",
  "ogrn",
  "legalAddress",
];

/** Required settings that are still empty — shown as a warning in the admin. */
export function missingLaunchSettings(s: StoreSettings): SettingsKey[] {
  return REQUIRED_FOR_LAUNCH.filter((k) => !s[k].trim());
}

/** Merge stored key/value rows over the defaults, ignoring unknown keys. */
export function mergeSettings(
  rows: { key: string; value: string }[],
): StoreSettings {
  const result: StoreSettings = { ...DEFAULT_SETTINGS };
  for (const { key, value } of rows) {
    if ((SETTINGS_KEYS as readonly string[]).includes(key)) {
      result[key as SettingsKey] = value;
    }
  }
  return result;
}

/** `tel:` href for a human-typed phone ("+7 (999) 123-45-67" → "tel:+79991234567"). */
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Turn what an owner may type into a social field into a link: a full URL is
 * kept, "@handle" becomes a t.me link for Telegram, a phone becomes a wa.me
 * link for WhatsApp. Returns null for an empty value.
 */
export function socialHref(
  kind: "telegram" | "whatsapp" | "vk" | "youtube",
  raw: string,
): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (kind === "telegram") return `https://t.me/${value.replace(/^@/, "")}`;
  if (kind === "whatsapp") return `https://wa.me/${value.replace(/\D/g, "")}`;
  if (kind === "vk") return `https://vk.com/${value.replace(/^@/, "")}`;
  return `https://youtube.com/${value.startsWith("@") ? value : `@${value}`}`;
}
