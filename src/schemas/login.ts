import { z } from "zod";
import { emailField } from "./auth";

export const loginSchema = z.object({
  email: emailField,
  // No length rule on login: accounts created under an older, shorter
  // minimum must still be able to sign in.
  password: z.string().min(1, "Введите пароль").max(200),
});

export type LoginInput = z.input<typeof loginSchema>;
