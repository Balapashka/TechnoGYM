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
import {
  extractChats,
  isTokenRejected,
  looksLikeBotToken,
  mergeChats,
  normalizeApiBase,
  type TgChat,
} from "@/lib/telegram-chats";
import { BRAND_NAME } from "@/lib/brand";

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
  const bot = cfg ? await telegramApi<BotInfo>(cfg, "getMe").catch(() => null) : null;
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
    bot = await telegramApi<BotInfo>(target, "getMe");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[telegram] getMe failed:", message);
    const { status: code, ...body } = connectError(message, target.apiBase);
    return NextResponse.json({ ...body, detail: message.slice(0, 200) }, { status: code });
  }

  const updates = await telegramApi<unknown[]>(target, "getUpdates", { timeout: 0 }).catch(() => []);
  const found = extractChats(updates as Parameters<typeof extractChats>[0]);
  const chats = mergeChats(token === current?.token ? current.chats : [], found);
  await saveTelegramConfig(token, chats, relay);

  const fresh = found.filter((c) => !current?.chats.some((s) => s.id === c.id) || token !== current?.token);
  await Promise.all(
    fresh.map((c) =>
      telegramApi(target, "sendMessage", {
        chat_id: c.id,
        text: `✅ ${BRAND_NAME}: уведомления о заказах и заявках подключены. Сюда будут приходить новые заказы.`,
      }).catch(() => null),
    ),
  );

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

/** DELETE — disconnect the bot (the relay address stays). */
export async function DELETE() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  await clearTelegramConfig();
  return NextResponse.json(await status(null, null, []));
}
