import { NextResponse } from "next/server";
import { forbidUnlessAdmin } from "@/lib/auth";
import { getTelegramConfig, telegramApi } from "@/lib/telegram-config";
import { BRAND_NAME } from "@/lib/brand";

/** POST — send a test message to every recipient; reports how many got it. */
export async function POST() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const cfg = await getTelegramConfig();
  if (!cfg || cfg.chats.length === 0) {
    return NextResponse.json({ error: "Сначала добавьте получателя" }, { status: 400 });
  }
  const results = await Promise.all(
    cfg.chats.map((chat) =>
      telegramApi(cfg, "sendMessage", {
        chat_id: chat.id,
        text: `🔔 ${BRAND_NAME}: проверка связи. Уведомления о новых заказах и заявках приходят сюда.`,
      })
        .then(() => ({ ...chat, ok: true }))
        .catch((e) => {
          console.error("[telegram] test failed:", chat.id, e);
          return { ...chat, ok: false };
        }),
    ),
  );
  return NextResponse.json({ sent: results.filter((r) => r.ok).length, total: results.length, results });
}
