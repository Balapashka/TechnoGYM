import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email over SMTP (Яндекс 360, Mail.ru для бизнеса, Unisender Go, …).
 * Configured entirely by environment variables — see `.env.example`:
 *
 *   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS,
 *   SMTP_FROM ("SPORT LINER <shop@example.ru>")
 *
 * Without SMTP_HOST mail is disabled and `sendMail` returns false — callers
 * must treat email as best-effort and never fail a request because of it.
 */

let transporter: Transporter | null = null;

export function mailEnabled(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

function getTransporter(): Transporter | null {
  if (!mailEnabled()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
    });
  }
  return transporter;
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
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      ...mail,
    });
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
