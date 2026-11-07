import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidUnlessAdmin } from "@/lib/auth";
import {
  clearTelegramConfig,
  getTelegramConfig,
  saveTelegramConfig,
  telegramApi,
} from "@/lib/telegram-config";
import { extractChats, looksLikeBotToken, mergeChats } from "@/lib/telegram-chats";
import { BRAND_NAME } from "@/lib/brand";

type BotInfo = { username: string; first_name: string };

/** GET — connection status (never the token itself). */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const cfg = await getTelegramConfig();
  if (!cfg) return NextResponse.json({ connected: false, chats: [] });
  const bot = await telegramApi<BotInfo>(cfg.token, "getMe").catch(() => null);
  return NextResponse.json({
    connected: cfg.chats.length > 0,
    bot: bot?.username ?? null,
    chats: cfg.chats,
  });
}

const bodySchema = z.object({ token: z.string().trim().max(200).optional() });

/**
 * POST — connect or refresh. With `token`: verify it and save it. Then read the
 * chats that wrote to the bot (/start), add them and send each a test message.
 */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Неверные данные" }, { status: 400 });

  const current = await getTelegramConfig();
  const token = parsed.data.token || current?.token;
  if (!token || !looksLikeBotToken(token)) {
    return NextResponse.json(
      { error: "Вставьте токен бота из @BotFather (вида 123456789:AA…)" },
      { status: 400 },
    );
  }

  let bot: BotInfo;
  try {
    bot = await telegramApi<BotInfo>(token, "getMe");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Telegram answered and refused the token, or we could not reach it at all.
    const unauthorized = /unauthorized|not found/i.test(message);
    console.error("[telegram] getMe failed:", message);
    return NextResponse.json(
      {
        error: unauthorized
          ? "Telegram не принял токен — проверьте его"
          : "Сервер не может связаться с Telegram (api.telegram.org недоступен из дата-центра). Уведомления можно получать на почту.",
        detail: message.slice(0, 200),
      },
      { status: unauthorized ? 400 : 502 },
    );
  }

  const updates = await telegramApi<unknown[]>(token, "getUpdates", { timeout: 0 }).catch(() => []);
  const found = extractChats(updates as Parameters<typeof extractChats>[0]);
  const chats = mergeChats(token === current?.token ? current.chats : [], found);
  await saveTelegramConfig(token, chats);

  const fresh = found.filter((c) => !current?.chats.some((s) => s.id === c.id) || token !== current?.token);
  await Promise.all(
    fresh.map((c) =>
      telegramApi(token, "sendMessage", {
        chat_id: c.id,
        text: `✅ ${BRAND_NAME}: уведомления о заказах и заявках подключены. Сюда будут приходить новые заказы.`,
      }).catch(() => null),
    ),
  );

  return NextResponse.json({ connected: chats.length > 0, bot: bot.username, chats });
}

/** DELETE — disconnect the bot. */
export async function DELETE() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  await clearTelegramConfig();
  return NextResponse.json({ ok: true });
}
