/**
 * Pure helpers for connecting the Telegram bot from the admin panel: the
 * owner opens t.me/<bot>?start=<one-time code>, presses Start, and we find
 * that chat in getUpdates.
 */
export type TgChat = { id: string; title: string };

type Chat = { id: number | string; type?: string; title?: string; first_name?: string; last_name?: string; username?: string };
export type Update = {
  update_id?: number;
  message?: { chat?: Chat; text?: string };
};

export function chatTitle(c: Chat): string {
  if (c.title) return c.title;
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return name || (c.username ? `@${c.username}` : String(c.id));
}

/** Merge newly found chats into the saved list, keeping order and titles. */
export function mergeChats(saved: TgChat[], found: TgChat[]): TgChat[] {
  const map = new Map(saved.map((c) => [c.id, c]));
  for (const c of found) map.set(c.id, c);
  return [...map.values()];
}

/** A bot token as BotFather issues it: "123456789:AA…". */
export function looksLikeBotToken(v: string): boolean {
  return /^\d{5,15}:[A-Za-z0-9_-]{30,}$/.test(v.trim());
}

/**
 * Relay address as the owner may paste it: "https://relay.example/" →
 * "https://relay.example". Only plain https URLs pass; anything else → "".
 */
export function normalizeApiBase(raw: string): string {
  const value = raw.trim().replace(/\/+$/, "");
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return "";
    return value;
  } catch {
    return "";
  }
}

/** Telegram answered and refused the token (as opposed to "could not reach it"). */
export function isTokenRejected(message: string): boolean {
  return /unauthorized|not found/i.test(message);
}

/** One-time code the admin puts into the t.me/<bot>?start=<code> link. */
export const LINK_CODE_RE = /^[A-Za-z0-9_-]{16,64}$/;

/** A fresh random link code (browser or Node 19+). */
export function newLinkCode(): string {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * The chat that pressed Start in the admin's link: Telegram delivers it as
 * "/start <code>" (private chat) or "/start@bot <code>" (group). Only that
 * chat is linked — a stranger who finds the public bot gets nothing.
 */
export function findLinkedChat(updates: Update[], code: string): TgChat | null {
  for (const u of updates) {
    const m = u.message;
    const match = m?.text?.trim().match(/^\/start(?:@\w+)?\s+(\S+)$/);
    if (match && match[1] === code && m?.chat && m.chat.id !== undefined) {
      return { id: String(m.chat.id), title: chatTitle(m.chat) };
    }
  }
  return null;
}

/** Highest update_id in a batch — confirm with offset = max + 1. */
export function maxUpdateId(updates: Update[]): number | null {
  const ids = updates.map((u) => u.update_id).filter((id): id is number => typeof id === "number");
  return ids.length ? Math.max(...ids) : null;
}
