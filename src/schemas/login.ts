import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Укажите email").email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type LoginInput = z.infer<typeof loginSchema>;
