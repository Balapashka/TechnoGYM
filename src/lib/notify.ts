import "server-only";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import { getSmtpConfig, sendMail, textToHtml } from "@/lib/mailer";
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
import { getTelegramConfig, telegramApi } from "@/lib/telegram-config";

/**
 * Manager notifications. Two channels, both optional and env-configured:
 *
 * - Telegram: connected in /admin/settings (bot token + chats that wrote /start
 *   to the bot), or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in the env. From a
 *   Russian data centre it goes through a relay (tools/telegram-relay). By
 *   default Telegram gets no customer contacts — they stay in the admin/email.
 * - Email:    the "Почта" block in /admin/settings or SMTP_* (src/lib/mailer.ts);
 *   sent to NOTIFY_EMAIL, else the store email, else the sending mailbox.
 *
 * Every function here is best-effort: it logs and swallows errors, because a
 * flaky Telegram API must never cost the shop an order.
 */

export async function telegramEnabled(): Promise<boolean> {
  const cfg = await getTelegramConfig();
  return Boolean(cfg && cfg.chats.length > 0);
}

/**
 * Send to every connected chat (owner, managers' group…). `short` is the
 * version without the customer's personal data — used unless the owner
 * allowed contacts in Telegram (see MessageOptions in notify-messages.ts).
 */
async function sendTelegram(full: string, short: string): Promise<void> {
  const cfg = await getTelegramConfig();
  if (!cfg) return;
  const text = cfg.includeContacts ? full : short;
  await Promise.all(
    cfg.chats.map((chat) =>
      telegramApi(cfg, "sendMessage", {
        chat_id: chat.id,
        text,
        disable_web_page_preview: true,
      }).catch((e) => console.error("[telegram] send failed:", chat.id, e)),
    ),
  );
}

async function managerEmail(): Promise<string | null> {
  if (process.env.NOTIFY_EMAIL) return process.env.NOTIFY_EMAIL;
  const s = await getSettings();
  if (s.email) return s.email;
  // Nothing set: write to the mailbox the shop sends from.
  return (await getSmtpConfig())?.user || null;
}

/** Email gets the full text; Telegram the short one unless contacts are allowed. */
async function notifyManager(subject: string, full: string, short = full): Promise<void> {
  const to = await managerEmail();
  await Promise.all([
    sendTelegram(full, short),
    to ? sendMail({ to, subject, text: full, html: textToHtml(full) }) : null,
  ]);
}

/** Admin «Отправить проверочное письмо»: one email to where notifications go. */
export async function sendManagerTestEmail(): Promise<{ to: string | null; ok: boolean }> {
  const to = await managerEmail();
  if (!to) return { to: null, ok: false };
  const text = `🔔 ${BRAND_NAME}: проверка почты.\n\nУведомления о новых заказах и заявках с сайта приходят на этот адрес.`;
  const ok = await sendMail({
    to,
    subject: `${BRAND_NAME}: проверка уведомлений`,
    text,
    html: textToHtml(text),
  });
  return { to, ok };
}

/** New order: alert the manager and confirm to the customer. */
export async function notifyNewOrder(order: OrderForMessage): Promise<void> {
  try {
    const settings = await getSettings();
    const url = `${SITE_URL}/admin/orders/${order.id}`;
    const text = managerOrderMessage(order, url);
    const short = managerOrderMessage(order, url, { contacts: false });
    const customer = customerOrderMessage(order, BRAND_NAME, settings.phone);
    await Promise.all([
      notifyManager(text.split("\n")[0], text, short),
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
    const url = `${SITE_URL}/admin/quote-requests`;
    const text = managerLeadMessage(lead, url);
    await notifyManager(text.split("\n")[0], text, managerLeadMessage(lead, url, { contacts: false }));
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
