/**
 * SMTP servers of the mail services a Russian shop owner is likely to use.
 * Pure — the admin "Почта" form only asks for the address and an app
 * password; the server is derived from the domain.
 */
export type SmtpPreset = { host: string; port: number; label: string };

const PRESETS: { domains: string[]; preset: SmtpPreset }[] = [
  {
    domains: ["yandex.ru", "ya.ru", "yandex.com", "yandex.by", "yandex.kz", "narod.ru"],
    preset: { host: "smtp.yandex.ru", port: 465, label: "Яндекс Почта" },
  },
  {
    domains: ["mail.ru", "bk.ru", "list.ru", "inbox.ru", "internet.ru", "vk.com"],
    preset: { host: "smtp.mail.ru", port: 465, label: "Mail.ru" },
  },
  { domains: ["gmail.com", "googlemail.com"], preset: { host: "smtp.gmail.com", port: 465, label: "Gmail" } },
  { domains: ["rambler.ru", "lenta.ru", "ro.ru"], preset: { host: "smtp.rambler.ru", port: 465, label: "Рамблер" } },
];

/** Preset for an address, or null for a custom domain (Яндекс 360 etc. — host must be given). */
export function smtpPresetFor(email: string): SmtpPreset | null {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return PRESETS.find((p) => p.domains.includes(domain))?.preset ?? null;
}

/** Turn a nodemailer error into a sentence the owner can act on. */
export function smtpErrorHint(message: string): string {
  if (/535|auth|credentials|password|username/i.test(message)) {
    return "Почта не приняла логин или пароль. Нужен именно «пароль приложения», а не обычный пароль от почты.";
  }
  if (/timeout|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH/i.test(message)) {
    return "Не удалось соединиться с почтовым сервером. Проверьте адрес сервера.";
  }
  return "Письмо не отправилось. Проверьте адрес и пароль приложения.";
}
