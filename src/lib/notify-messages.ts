/**
 * Text of the notifications sent to the store manager and to customers.
 * Pure functions (no I/O) so the wording is unit-tested.
 */
import { formatPrice } from "@/lib/format";
import {
  DELIVERY_RU,
  LEAD_SOURCE_RU,
  ORDER_STATUS_RU,
  PAYMENT_RU,
  orderNumber,
  type OrderStatusValue,
} from "@/lib/order-format";

export type OrderForMessage = {
  id: string;
  email: string;
  customerName: string;
  phone: string;
  deliveryMethod: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  comment: string | null;
  paymentMethod: string;
  totalCents: number;
  currency: string;
  items: {
    nameSnapshot: string;
    variantName: string | null;
    quantity: number;
    priceCents: number;
  }[];
};

export type LeadForMessage = {
  source: string;
  productName: string;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
};

const money = (cents: number, currency: string) => formatPrice(cents, currency);

function itemLines(order: OrderForMessage): string[] {
  return order.items.map((i) => {
    const variant = i.variantName ? ` (${i.variantName})` : "";
    return `• ${i.nameSnapshot}${variant} × ${i.quantity} — ${money(
      i.priceCents * i.quantity,
      order.currency,
    )}`;
  });
}

function deliveryLine(order: OrderForMessage): string {
  if (order.deliveryMethod === "pickup") return "Самовывоз";
  const parts = [order.postalCode, order.country, order.city, order.address]
    .map((p) => p.trim())
    .filter(Boolean);
  return `Доставка: ${parts.join(", ")}`;
}

/** Message to the manager (Telegram / email) about a new order. */
export function managerOrderMessage(
  order: OrderForMessage,
  adminUrl: string,
): string {
  return [
    `🛒 Новый заказ №${orderNumber(order.id)} — ${money(order.totalCents, order.currency)}`,
    "",
    ...itemLines(order),
    "",
    `Покупатель: ${order.customerName}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email}`,
    deliveryLine(order),
    `Оплата: ${PAYMENT_RU[order.paymentMethod] ?? order.paymentMethod}`,
    ...(order.comment ? [`Комментарий: ${order.comment}`] : []),
    "",
    adminUrl,
  ].join("\n");
}

/** Confirmation email to the customer right after checkout. */
export function customerOrderMessage(
  order: OrderForMessage,
  storeName: string,
  storePhone: string,
): { subject: string; text: string } {
  const number = orderNumber(order.id);
  const payment =
    order.paymentMethod === "online"
      ? "Вы выбрали онлайн-оплату. Если оплата не завершилась, менеджер пришлёт ссылку повторно."
      : "Менеджер свяжется с вами, чтобы подтвердить наличие, сроки и стоимость доставки и согласовать способ оплаты.";
  return {
    subject: `Заказ №${number} принят — ${storeName}`,
    text: [
      `Здравствуйте, ${order.customerName}!`,
      "",
      `Спасибо за заказ в ${storeName}. Номер заказа: ${number}.`,
      "",
      ...itemLines(order),
      "",
      `Итого: ${money(order.totalCents, order.currency)}`,
      `${DELIVERY_RU[order.deliveryMethod] ?? order.deliveryMethod}. ${deliveryLine(order)}`,
      "",
      payment,
      ...(storePhone ? ["", `Вопросы по заказу: ${storePhone}`] : []),
      "",
      `С уважением, ${storeName}`,
    ].join("\n"),
  };
}

/** Status change email to the customer. */
export function customerStatusMessage(
  orderId: string,
  status: OrderStatusValue,
  storeName: string,
): { subject: string; text: string } {
  const number = orderNumber(orderId);
  const label = ORDER_STATUS_RU[status];
  return {
    subject: `Заказ №${number}: ${label.toLowerCase()} — ${storeName}`,
    text: [
      "Здравствуйте!",
      "",
      `Статус вашего заказа №${number} изменился: «${label}».`,
      "",
      `С уважением, ${storeName}`,
    ].join("\n"),
  };
}

/** Message to the manager about a new lead (price request / contact form). */
export function managerLeadMessage(
  lead: LeadForMessage,
  adminUrl: string,
): string {
  const kind = LEAD_SOURCE_RU[lead.source] ?? "Заявка";
  return [
    `📩 ${kind}: ${lead.productName}`,
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    ...(lead.email ? [`Email: ${lead.email}`] : []),
    ...(lead.comment ? [`Комментарий: ${lead.comment}`] : []),
    "",
    adminUrl,
  ].join("\n");
}
