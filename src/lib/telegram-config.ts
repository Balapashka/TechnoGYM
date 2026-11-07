import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeApiBase, type TgChat } from "@/lib/telegram-chats";
import { createSerial, withRetry } from "@/lib/retry";

/**
 * Telegram bot settings. Stored in the Setting table under private keys —
 * never part of StoreSettings, so they are not sent to any page. Env
 * variables (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, TELEGRAM_API_BASE) still
 * work and win.
 */
const TOKEN_KEY = "secret.telegramBotToken";
const CHATS_KEY = "secret.telegramChats";
/** Relay in front of api.telegram.org — see tools/telegram-relay. */
const API_BASE_KEY = "secret.telegramApiBase";
/** "true" = messages include the customer's name, phone and address. */
const CONTACTS_KEY = "secret.telegramIncludeContacts";

export const DEFAULT_API_BASE = "https://api.telegram.org";

export type TelegramConfig = {
  token: string;
  chats: TgChat[];
  /** Relay URL from the admin; "" = straight to api.telegram.org. */
  apiBase: string;
  includeContacts: boolean;
};

/** What a Bot API call needs: the token and where to send it. */
export type TelegramTarget = { token: string; apiBase?: string };

/** Relay set in the env — it wins over the admin field. */
export function envApiBase(): string {
  return normalizeApiBase(process.env.TELEGRAM_API_BASE ?? "");
}

async function readRows(): Promise<Map<string, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [TOKEN_KEY, CHATS_KEY, API_BASE_KEY, CONTACTS_KEY] } },
  });
  return new Map(rows.map((r) => [r.key, r.value]));
}

export async function getTelegramConfig(): Promise<TelegramConfig | null> {
  try {
    const rows = await readRows();
    const apiBase = envApiBase() || normalizeApiBase(rows.get(API_BASE_KEY) ?? "");
    const includeContacts = rows.get(CONTACTS_KEY) === "true";
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      return {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chats: process.env.TELEGRAM_CHAT_ID.split(",").map((id) => ({ id: id.trim(), title: id.trim() })),
        apiBase,
        includeContacts,
      };
    }
    const token = rows.get(TOKEN_KEY) ?? "";
    const chats = JSON.parse(rows.get(CHATS_KEY) ?? "[]") as TgChat[];
    return token ? { token, chats, apiBase, includeContacts } : null;
  } catch (e) {
    console.error("[telegram] could not read config:", e);
    return null;
  }
}

/** The relay saved in the admin (not the env one), for the settings form. */
export async function getSavedApiBase(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: API_BASE_KEY } }).catch(() => null);
  return normalizeApiBase(row?.value ?? "");
}

export async function getIncludeContacts(): Promise<boolean> {
  const row = await prisma.setting.findUnique({ where: { key: CONTACTS_KEY } }).catch(() => null);
  return row?.value === "true";
}

function upsert(key: string, value: string) {
  return prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

export async function saveTelegramConfig(token: string, chats: TgChat[], apiBase: string): Promise<void> {
  await prisma.$transaction([
    upsert(TOKEN_KEY, token),
    upsert(CHATS_KEY, JSON.stringify(chats)),
    upsert(API_BASE_KEY, normalizeApiBase(apiBase)),
  ]);
}

export async function saveIncludeContacts(on: boolean): Promise<void> {
  await upsert(CONTACTS_KEY, on ? "true" : "");
}

/** Disconnect the bot. The relay address stays — it belongs to the server. */
export async function clearTelegramConfig(): Promise<void> {
  await prisma.setting.deleteMany({ where: { key: { in: [TOKEN_KEY, CHATS_KEY] } } });
}

/** Telegram (or the relay) answered, but not with ok: true. */
export class TelegramApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TelegramApiError";
  }
}

// A normal call takes ~0.7 s; a stalled connection does not recover, so give
// up on it early and try a fresh one.
const ATTEMPTS = 5;
const ATTEMPT_TIMEOUT_MS = 4000;

/**
 * Call a Bot API method. Throws TelegramApiError with Telegram's description
 * when it refuses, or the network error. A new connection from the Moscow
 * server to the relay now and then stalls, so timeouts, network errors and
 * 5xx are retried with a fresh attempt; a refusal (bad token, 403, 409) is not.
 */
export async function telegramApi<T>(target: TelegramTarget, method: string, body?: unknown): Promise<T> {
  const base = target.apiBase || DEFAULT_API_BASE;
  return withRetry(
    async () => {
      const res = await fetch(`${base}/bot${target.token}/${method}`, {
        method: body ? "POST" : "GET",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string };
      if (!json.ok) throw new TelegramApiError(json.description || `Telegram HTTP ${res.status}`, res.status);
      return json.result as T;
    },
    {
      attempts: ATTEMPTS,
      delayMs: 400,
      retryable: (e) => !(e instanceof TelegramApiError) || e.status >= 500,
    },
  );
}

/** getUpdates calls must not overlap (Telegram answers 409 Conflict). */
export const serialUpdates = createSerial();
