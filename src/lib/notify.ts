import "server-only";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import { sendMail, textToHtml } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";
import {
  customerOrderMessage,
  customerStatusMessage,
  managerLeadMessage,
  managerOrderMessage,
  type LeadForMessage,
  type OrderForMessage,
} from "@/lib/notify-messages";
import { orderNumber, type OrderStatusValue } from "@/lib/order-format";

/**
 * Manager notifications. Two channels, both optional and env-configured:
 *
 * - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (a chat or group the bot is
 *   in). The quickest way to get an alert on the phone.
 * - Email:    SMTP_* (see src/lib/mailer.ts) + NOTIFY_EMAIL (falls back to the
 *   store email from /admin/settings).
 *
 * Every function here is best-effort: it logs and swallows errors, because a
 * flaky Telegram API must never cost the shop an order.
 */

export function telegramEnabled(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function sendTelegram(text: string): Promise<void> {
  if (!telegramEnabled()) return;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error("[telegram] send failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("[telegram] send failed:", e);
  }
}

async function managerEmail(): Promise<string | null> {
  if (process.env.NOTIFY_EMAIL) return process.env.NOTIFY_EMAIL;
  const s = await getSettings();
  return s.email || null;
}

async function notifyManager(subject: string, text: string): Promise<void> {
  const to = await managerEmail();
  await Promise.all([
    sendTelegram(text),
    to ? sendMail({ to, subject, text, html: textToHtml(text) }) : null,
  ]);
}

/** New order: alert the manager and confirm to the customer. */
export async function notifyNewOrder(order: OrderForMessage): Promise<void> {
  try {
    const settings = await getSettings();
    const text = managerOrderMessage(order, `${SITE_URL}/admin/orders/${order.id}`);
    const customer = customerOrderMessage(order, BRAND_NAME, settings.phone);
    await Promise.all([
      notifyManager(text.split("\n")[0], text),
      sendMail({
        to: order.email,
        subject: customer.subject,
        text: customer.text,
        html: textToHtml(customer.text),
        replyTo: settings.email || undefined,
      }),
    ]);
  } catch (e) {
    console.error("[notify] order notification failed:", e);
  }
}

/** Order status changed in the admin: let the customer know. */
export async function notifyOrderStatus(
  orderId: string,
  email: string,
  status: OrderStatusValue,
): Promise<void> {
  try {
    const settings = await getSettings();
    const msg = customerStatusMessage(orderId, status, BRAND_NAME);
    await sendMail({
      to: email,
      subject: msg.subject,
      text: msg.text,
      html: textToHtml(msg.text),
      replyTo: settings.email || undefined,
    });
  } catch (e) {
    console.error("[notify] status notification failed:", e);
  }
}

/** New lead (price request, business enquiry, contact form). */
export async function notifyNewLead(lead: LeadForMessage): Promise<void> {
  try {
    const text = managerLeadMessage(lead, `${SITE_URL}/admin/quote-requests`);
    await notifyManager(text.split("\n")[0], text);
  } catch (e) {
    console.error("[notify] lead notification failed:", e);
  }
}

/** Online payment confirmed by ЮKassa. */
export async function notifyOrderPaid(orderId: string): Promise<void> {
  try {
    const text = `✅ Заказ №${orderNumber(orderId)} оплачен онлайн\n\n${SITE_URL}/admin/orders/${orderId}`;
    await notifyManager(text.split("\n")[0], text);
  } catch (e) {
    console.error("[notify] paid notification failed:", e);
  }
}
