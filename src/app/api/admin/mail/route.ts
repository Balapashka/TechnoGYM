import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidUnlessAdmin } from "@/lib/auth";
import {
  clearSmtpConfig,
  createTransporter,
  getSmtpConfig,
  saveSmtpConfig,
  smtpFromEnv,
  type SmtpConfig,
} from "@/lib/mailer";
import { smtpErrorHint, smtpPresetFor } from "@/lib/smtp-presets";
import { BRAND_NAME } from "@/lib/brand";

/** GET — status only: the address, never the password. */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const cfg = await getSmtpConfig();
  return NextResponse.json({ connected: Boolean(cfg), user: cfg?.user ?? null, fromEnv: smtpFromEnv() });
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
  return NextResponse.json({ connected: true, user, fromEnv: false });
}

/** DELETE — disconnect. */
export async function DELETE() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  await clearSmtpConfig();
  return NextResponse.json({ connected: false, user: null, fromEnv: smtpFromEnv() });
}
