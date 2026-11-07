import { NextResponse } from "next/server";
import { forbidUnlessAdmin } from "@/lib/auth";
import { mailEnabled } from "@/lib/mailer";
import { sendManagerTestEmail } from "@/lib/notify";

/** POST — send a test email to the address order notifications go to. */
export async function POST() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  if (!(await mailEnabled())) {
    return NextResponse.json({ error: "Сначала подключите почту" }, { status: 400 });
  }
  const { to, ok } = await sendManagerTestEmail();
  if (!to) {
    return NextResponse.json(
      { error: "Не указан адрес для уведомлений — заполните «Email» в настройках магазина" },
      { status: 400 },
    );
  }
  if (!ok) {
    return NextResponse.json({ error: "Письмо не отправилось — проверьте подключение почты" }, { status: 502 });
  }
  return NextResponse.json({ to });
}
