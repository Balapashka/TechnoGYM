/**
 * Pure helpers for presenting orders to customers, the admin and in
 * notifications. No Prisma, no React — safe everywhere.
 */

/** Statuses an order moves through, in display order. Mirrors the Prisma enum. */
export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(v: unknown): v is OrderStatusValue {
  return typeof v === "string" && (ORDER_STATUSES as readonly string[]).includes(v);
}

/** Statuses of a quote request / lead. Mirrors the Prisma enum. */
export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(v: unknown): v is LeadStatusValue {
  return typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);
}

/**
 * Short human-friendly order number derived from the cuid: the last 8
 * characters, upper-cased. Stable, unique enough to read out over the phone,
 * and needs no extra column or counter.
 */
export function orderNumber(id: string): string {
  return id.slice(-8).toUpperCase();
}

/** Russian labels for notifications and the admin (the UI uses i18n). */
export const ORDER_STATUS_RU: Record<OrderStatusValue, string> = {
  PENDING: "Новый",
  PAID: "Оплачен",
  SHIPPED: "Отправлен",
  DELIVERED: "Выполнен",
  CANCELLED: "Отменён",
};

export const DELIVERY_RU: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Самовывоз",
};

export const PAYMENT_RU: Record<string, string> = {
  manual: "После подтверждения менеджером",
  online: "Онлайн-оплата картой",
};

export const LEAD_SOURCE_RU: Record<string, string> = {
  product: "Запрос цены",
  business: "Для бизнеса",
  contact: "Обратная связь",
};
