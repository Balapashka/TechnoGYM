/**
 * Pure helpers for connecting the Telegram bot from the admin panel: the
 * owner writes /start to the bot, and we read the chats from getUpdates.
 */
export type TgChat = { id: string; title: string };

type Chat = { id: number | string; type?: string; title?: string; first_name?: string; last_name?: string; username?: string };
type Update = {
  message?: { chat?: Chat };
  channel_post?: { chat?: Chat };
  my_chat_member?: { chat?: Chat };
};

export function chatTitle(c: Chat): string {
  if (c.title) return c.title;
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return name || (c.username ? `@${c.username}` : String(c.id));
}

/** Unique chats (private chats and groups) the bot has heard from. */
export function extractChats(updates: Update[]): TgChat[] {
  const map = new Map<string, TgChat>();
  for (const u of updates) {
    const chat = u.message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat;
    if (!chat || chat.id === undefined) continue;
    map.set(String(chat.id), { id: String(chat.id), title: chatTitle(chat) });
  }
  return [...map.values()];
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
