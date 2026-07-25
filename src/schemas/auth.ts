import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Укажите ваше имя"),
    email: z.string().min(1, "Укажите email").email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirm: z.string().min(6, "Повторите пароль"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({
  email: z.string().min(1, "Укажите email").email("Введите корректный email"),
});
export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({
    token: z.string().min(1, "Укажите код сброса"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirm: z.string().min(6, "Повторите пароль"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });
export type ResetInput = z.infer<typeof resetSchema>;
