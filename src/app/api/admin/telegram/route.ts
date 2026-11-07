import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidUnlessAdmin } from "@/lib/auth";
import {
  clearTelegramConfig,
  envApiBase,
  getIncludeContacts,
  getSavedApiBase,
  getTelegramConfig,
  saveIncludeContacts,
  saveTelegramConfig,
  telegramApi,
  type TelegramConfig,
} from "@/lib/telegram-config";
import { isTokenRejected, looksLikeBotToken, normalizeApiBase, type TgChat } from "@/lib/telegram-chats";

type BotInfo = { username: string; first_name: string };

/** What the settings block shows. Never includes the token. */
async function status(cfg: TelegramConfig | null, bot: BotInfo | null, chats: TgChat[]) {
  const [relay, includeContacts] = await Promise.all([getSavedApiBase(), getIncludeContacts()]);
  return {
    tokenSaved: Boolean(cfg),
    reachable: Boolean(bot),
    connected: Boolean(cfg) && chats.length > 0,
    bot: bot?.username ?? null,
    chats,
    relay,
    relayFromEnv: Boolean(envApiBase()),
    includeContacts,
  };
}

async function currentStatus() {
  const cfg = await getTelegramConfig();
  const bot = cfg ? await telegramApi<BotInfo>(cfg, "getMe", undefined, { attempts: 4 }).catch(() => null) : null;
  return status(cfg, bot, cfg?.chats ?? []);
}

/** GET — connection status. */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json(await currentStatus());
}

const bodySchema = z.object({
  token: z.string().trim().max(200).optional(),
  /** Relay address; "" removes it, absent keeps the saved one. */
  relay: z.string().trim().max(300).optional(),
});

/** Turn a failed getMe into a sentence the owner can act on. */
function connectError(message: string, apiBase: string) {
  if (isTokenRejected(message)) {
    return { status: 400, error: "Telegram не принял токен — проверьте его", code: "token" };
  }
  if (apiBase) {
    const host = new URL(apiBase).host;
    return /^Telegram HTTP \d+$/.test(message)
      ? { status: 502, error: `Ретранслятор ${host} не пропустил запрос (${message.slice(9)}). Проверьте его адрес.`, code: "relay" }
      : { status: 502, error: `Не удалось связаться с ретранслятором ${host}. Проверьте адрес или повторите через пару минут.`, code: "relay" };
  }
  return {
    status: 502,
    error:
      "Сервер не может связаться с Telegram: из российских дата-центров он заблокирован. Укажите адрес ретранслятора (его даёт разработчик) или получайте уведомления на почту.",
    code: "unreachable",
  };
}

/**
 * POST — connect or re-check. With `token`: verify it and save it (a new bot
 * starts with no recipients). `relay` sets or clears the relay address.
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

  let relay = await getSavedApiBase();
  if (parsed.data.relay !== undefined) {
    relay = normalizeApiBase(parsed.data.relay);
    if (parsed.data.relay && !relay) {
      return NextResponse.json(
        { error: "Адрес ретранслятора — полная ссылка, начинается с https://", code: "relay" },
        { status: 400 },
      );
    }
  }
  const target = { token, apiBase: envApiBase() || relay };

  let bot: BotInfo;
  try {
    bot = await telegramApi<BotInfo>(target, "getMe", undefined, { attempts: 4 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[telegram] getMe failed:", message);
    const { status: code, ...body } = connectError(message, target.apiBase);
    return NextResponse.json({ ...body, detail: message.slice(0, 200) }, { status: code });
  }

  // Recipients are added one by one through a one-time link (link/route.ts),
  // never from whoever happened to write to the public bot.
  const chats = token === current?.token ? current.chats : [];
  await saveTelegramConfig(token, chats, relay);

  return NextResponse.json(await status(await getTelegramConfig(), bot, chats));
}

const patchSchema = z.object({ includeContacts: z.boolean() });

/** PATCH — options that need no call to Telegram. */
export async function PATCH(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  await saveIncludeContacts(parsed.data.includeContacts);
  return NextResponse.json(await currentStatus());
}

/** DELETE — `?chat=<id>` removes one recipient; without it, disconnects the bot (the relay stays). */
export async function DELETE(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const chatId = new URL(request.url).searchParams.get("chat");
  if (chatId) {
    const cfg = await getTelegramConfig();
    if (cfg) {
      await saveTelegramConfig(cfg.token, cfg.chats.filter((c) => c.id !== chatId), await getSavedApiBase());
    }
    return NextResponse.json(await currentStatus());
  }
  await clearTelegramConfig();
  return NextResponse.json(await status(null, null, []));
}
