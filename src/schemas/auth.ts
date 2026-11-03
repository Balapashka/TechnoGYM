import { z } from "zod";

/**
 * Emails are compared case-insensitively: "Ivan@Mail.ru" and "ivan@mail.ru"
 * are one account. Normalized here so every route stores and looks up the
 * same form.
 */
export const emailField = z
  .string()
  .trim()
  .min(1, "Укажите email")
  .max(254, "Слишком длинный email")
  .pipe(z.email("Введите корректный email"))
  .transform((v) => v.toLowerCase());

/** New passwords: at least 8 characters (bcrypt ignores bytes past 72). */
export const newPasswordField = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов")
  .max(72, "Пароль слишком длинный");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Укажите ваше имя").max(100),
    email: emailField,
    password: newPasswordField,
    confirm: z.string().min(1, "Повторите пароль"),
    consent: z.literal(true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;

export const forgotSchema = z.object({
  email: emailField,
});

export type ForgotInput = z.input<typeof forgotSchema>;

export const resetSchema = z
  .object({
    token: z.string().trim().min(1, "Укажите код сброса").max(200),
    password: newPasswordField,
    confirm: z.string().min(1, "Повторите пароль"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });

export type ResetInput = z.infer<typeof resetSchema>;
