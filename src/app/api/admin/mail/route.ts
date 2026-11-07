import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidUnlessAdmin } from "@/lib/auth";
import {
  clearSmtpConfig,
  createTransporter,
  getNotifyEmail,
  getSmtpConfig,
  saveNotifyEmail,
  saveSmtpConfig,
  smtpFromEnv,
  type SmtpConfig,
} from "@/lib/mailer";
import { managerEmail } from "@/lib/notify";
import { smtpErrorHint, smtpPresetFor } from "@/lib/smtp-presets";
import { BRAND_NAME } from "@/lib/brand";

async function status() {
  const [cfg, notifyEmail, notifyTo] = await Promise.all([getSmtpConfig(), getNotifyEmail(), managerEmail()]);
  return {
    connected: Boolean(cfg),
    user: cfg?.user ?? null,
    fromEnv: smtpFromEnv(),
    /** Saved private address ("" = not set). */
    notifyEmail,
    /** Where notifications actually go right now. */
    notifyTo,
  };
}

/** GET — status only: addresses, never the password. */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json(await status());
}

const patchSchema = z.object({
  notifyEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email().max(200)]),
});

/** PATCH — where to send order/lead notifications ("" = the store email). */
export async function PATCH(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
  await saveNotifyEmail(parsed.data.notifyEmail);
  return NextResponse.json(await status());
}

const bodySchema = z.object({
  user: z.string().trim().toLowerCase().email().max(200),
  pass: z.string().trim().min(1).max(200),
  host: z.string().trim().max(200).optional(),
});

/** POST — verify the mailbox by sending a test letter to itself, then save. */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите адрес почты и пароль приложения" }, { status: 400 });
  }
  const { user, pass } = parsed.data;
  const preset = smtpPresetFor(user);
  const host = parsed.data.host || preset?.host;
  if (!host) {
    return NextResponse.json(
      { error: "Для почты на своём домене укажите почтовый сервер (для Яндекс 360 — smtp.yandex.ru)", needHost: true },
      { status: 400 },
    );
  }

  const cfg: SmtpConfig = { host, port: 465, user, pass, from: `${BRAND_NAME} <${user}>` };
  try {
    await createTransporter(cfg).sendMail({
      from: cfg.from,
      to: user,
      subject: `${BRAND_NAME}: почта подключена`,
      text: `Готово! Сюда будут приходить новые заказы и заявки с сайта, а покупатели будут получать письма о своих заказах с этого адреса.`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[mail] test send failed:", message);
    return NextResponse.json({ error: smtpErrorHint(message), detail: message.slice(0, 200) }, { status: 400 });
  }
  await saveSmtpConfig(cfg);
  return NextResponse.json(await status());
}

/** DELETE — disconnect. */
export async function DELETE() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  await clearSmtpConfig();
  return NextResponse.json(await status());
}
