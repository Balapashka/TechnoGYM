import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/schemas/auth";
import { limitRequest } from "@/lib/rate-limit";
import { mailEnabled, sendMail, textToHtml } from "@/lib/mailer";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";

/**
 * Whether to return the reset token in the response body.
 *
 * Only for a local demo without a mail server: anyone who knows an email could
 * then reset that account, so it is opt-in and must stay off in production,
 * where the link is emailed instead (SMTP_* variables).
 */
const exposeToken = process.env.DEMO_EXPOSE_RESET_TOKEN === "true";

const GENERIC_MESSAGE =
  "Если такой email зарегистрирован, мы отправили на него ссылку для сброса пароля.";

/** POST /api/auth/forgot-password — issue a reset token and email it. */
export async function POST(request: Request) {
  const limited = limitRequest(request, "forgot", 5, 60 * 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Always respond the same way so the form does not reveal which emails exist.
  if (!user) {
    return NextResponse.json({ ok: true, token: null, message: GENERIC_MESSAGE });
  }

  const token = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  });

  if (await mailEnabled()) {
    const link = `${SITE_URL}/reset-password?token=${token}`;
    const text = [
      "Здравствуйте!",
      "",
      `Чтобы задать новый пароль для ${BRAND_NAME}, перейдите по ссылке (действует 1 час):`,
      link,
      "",
      "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
    ].join("\n");
    await sendMail({
      to: user.email,
      subject: `Сброс пароля — ${BRAND_NAME}`,
      text,
      html: textToHtml(text),
    });
  }

  if (!exposeToken) {
    return NextResponse.json({ ok: true, token: null, message: GENERIC_MESSAGE });
  }

  return NextResponse.json({
    ok: true,
    token,
    message: "Код сброса создан (тестовый режим: он показан здесь вместо письма).",
  });
}
