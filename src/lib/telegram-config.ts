import "server-only";
import { prisma } from "@/lib/prisma";
import type { TgChat } from "@/lib/telegram-chats";

/**
 * Telegram bot credentials. Stored in the Setting table under private keys —
 * never part of StoreSettings, so they are not sent to any page. Env
 * variables (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) still work and win.
 */
const TOKEN_KEY = "secret.telegramBotToken";
const CHATS_KEY = "secret.telegramChats";

export type TelegramConfig = { token: string; chats: TgChat[] };

export async function getTelegramConfig(): Promise<TelegramConfig | null> {
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    return {
      token: process.env.TELEGRAM_BOT_TOKEN,
      chats: process.env.TELEGRAM_CHAT_ID.split(",").map((id) => ({ id: id.trim(), title: id.trim() })),
    };
  }
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: [TOKEN_KEY, CHATS_KEY] } } });
    const token = rows.find((r) => r.key === TOKEN_KEY)?.value ?? "";
    const chats = JSON.parse(rows.find((r) => r.key === CHATS_KEY)?.value ?? "[]") as TgChat[];
    return token ? { token, chats } : null;
  } catch (e) {
    console.error("[telegram] could not read config:", e);
    return null;
  }
}

export async function saveTelegramConfig(token: string, chats: TgChat[]): Promise<void> {
  await prisma.$transaction([
    prisma.setting.upsert({ where: { key: TOKEN_KEY }, update: { value: token }, create: { key: TOKEN_KEY, value: token } }),
    prisma.setting.upsert({
      where: { key: CHATS_KEY },
      update: { value: JSON.stringify(chats) },
      create: { key: CHATS_KEY, value: JSON.stringify(chats) },
    }),
  ]);
}

export async function clearTelegramConfig(): Promise<void> {
  await prisma.setting.deleteMany({ where: { key: { in: [TOKEN_KEY, CHATS_KEY] } } });
}

/** Call a Bot API method. Throws with Telegram's description on failure. */
export async function telegramApi<T>(token: string, method: string, body?: unknown): Promise<T> {
  // TELEGRAM_API_BASE: a relay for servers where api.telegram.org is blocked.
  const base = (process.env.TELEGRAM_API_BASE || "https://api.telegram.org").replace(/\/$/, "");
  const res = await fetch(`${base}/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string };
  if (!json.ok) throw new Error(json.description || `Telegram HTTP ${res.status}`);
  return json.result as T;
}
