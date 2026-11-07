import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidUnlessAdmin } from "@/lib/auth";
import {
  TelegramApiError,
  getSavedApiBase,
  getTelegramConfig,
  saveTelegramConfig,
  serialUpdates,
  telegramApi,
} from "@/lib/telegram-config";
import { LINK_CODE_RE, findLinkedChat, mergeChats, staleOffset, type TgChat, type Update } from "@/lib/telegram-chats";
import { BRAND_NAME } from "@/lib/brand";

const bodySchema = z.object({ code: z.string().regex(LINK_CODE_RE) });

/**
 * POST { code } — the admin opened t.me/<bot>?start=<code> and pressed Start.
 * Polled by the settings block every few seconds: answers { linked: false }
 * until Telegram delivers "/start <code>", then adds exactly that chat.
 */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Неверный код" }, { status: 400 });

  const cfg = await getTelegramConfig();
  if (!cfg) return NextResponse.json({ error: "Сначала подключите бота" }, { status: 400 });

  let chat: TgChat | null;
  try {
    chat = await serialUpdates(async () => {
      const updates = await telegramApi<Update[]>(cfg, "getUpdates", {
        timeout: 0,
        allowed_updates: ["message"],
      });
      // Drop stale updates so strangers' /start never fills the queue; fresh
      // ones stay for a parallel link (another admin tab, a manager's link).
      const offset = staleOffset(updates, Math.floor(Date.now() / 1000));
      if (offset !== null) {
        await telegramApi(cfg, "getUpdates", { offset, limit: 1, timeout: 0 }).catch(() => null);
      }
      return findLinkedChat(updates, parsed.data.code);
    });
  } catch (e) {
    // 409: another getUpdates (e.g. a second server process) is running — just poll again.
    if (e instanceof TelegramApiError && e.status === 409) return NextResponse.json({ linked: false });
    console.error("[telegram] getUpdates failed:", e);
    return NextResponse.json({ error: "Сервер не может связаться с Telegram" }, { status: 502 });
  }

  if (!chat) return NextResponse.json({ linked: false });

  const chats = mergeChats(cfg.chats, [chat]);
  await saveTelegramConfig(cfg.token, chats, await getSavedApiBase());
  await telegramApi(cfg, "sendMessage", {
    chat_id: chat.id,
    text: `✅ ${BRAND_NAME}: этот чат подключён. Сюда будут приходить новые заказы и заявки с сайта.`,
  }).catch((e) => console.error("[telegram] welcome failed:", e));

  return NextResponse.json({ linked: true, chat, chats });
}
