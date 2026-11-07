import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { prisma } from "@/lib/prisma";

/**
 * Outgoing email over SMTP (Яндекс Почта / Яндекс 360, Mail.ru, …).
 *
 * Two sources, env wins:
 *   - SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS,
 *     SMTP_FROM — see `.env.example`;
 *   - the "Почта" block in /admin/settings, stored in the Setting table under
 *     the private key `secret.smtp` (never part of StoreSettings, so the
 *     password never reaches a page).
 *
 * Without either, mail is disabled and `sendMail` returns false — callers must
 * treat email as best-effort and never fail a request because of it.
 */

export type SmtpConfig = { host: string; port: number; user: string; pass: string; from: string };

const SMTP_KEY = "secret.smtp";
/** Where order/lead notifications go, if not the public store email. */
const NOTIFY_KEY = "secret.notifyEmail";

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
    };
  }
  try {
    const row = await prisma.setting.findUnique({ where: { key: SMTP_KEY } });
    if (!row) return null;
    const cfg = JSON.parse(row.value) as SmtpConfig;
    return cfg.host ? cfg : null;
  } catch (e) {
    console.error("[mail] could not read config:", e);
    return null;
  }
}

export async function saveSmtpConfig(cfg: SmtpConfig): Promise<void> {
  const value = JSON.stringify(cfg);
  await prisma.setting.upsert({ where: { key: SMTP_KEY }, update: { value }, create: { key: SMTP_KEY, value } });
}

export async function clearSmtpConfig(): Promise<void> {
  await prisma.setting.deleteMany({ where: { key: SMTP_KEY } });
}

/**
 * Private address for manager notifications (never shown on the site). Lets
 * the public "Email магазина" be the shop mailbox while orders still go
 * straight to the owner. "" = not set.
 */
export async function getNotifyEmail(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: NOTIFY_KEY } }).catch(() => null);
  return row?.value ?? "";
}

export async function saveNotifyEmail(email: string): Promise<void> {
  if (!email) {
    await prisma.setting.deleteMany({ where: { key: NOTIFY_KEY } });
    return;
  }
  await prisma.setting.upsert({ where: { key: NOTIFY_KEY }, update: { value: email }, create: { key: NOTIFY_KEY, value: email } });
}

/** True when SMTP comes from the env (the admin form then only shows status). */
export function smtpFromEnv(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

export async function mailEnabled(): Promise<boolean> {
  return (await getSmtpConfig()) !== null;
}

let cached: { key: string; transporter: Transporter } | null = null;

export function createTransporter(cfg: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });
}

async function getTransporter(): Promise<{ t: Transporter; from: string } | null> {
  const cfg = await getSmtpConfig();
  if (!cfg) return null;
  const key = JSON.stringify(cfg);
  if (cached?.key !== key) cached = { key, transporter: createTransporter(cfg) };
  return { t: cached.transporter, from: cfg.from || cfg.user };
}

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/** Send one email. Resolves to true on success, false when disabled or failed. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const tr = await getTransporter();
  if (!tr) return false;
  try {
    await tr.t.sendMail({ from: tr.from, ...mail });
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e);
    return false;
  }
}

/** Escape text for the simple HTML email bodies. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text → minimal HTML (paragraphs + line breaks), escaped. */
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}
