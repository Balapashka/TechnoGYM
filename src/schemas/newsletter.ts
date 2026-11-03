import { z } from "zod";
import { emailField } from "./auth";

export const newsletterSchema = z.object({
  email: emailField,
  consent: z.literal(true, {
    message: "Необходимо согласие на получение рассылки",
  }),
});

export type NewsletterInput = z.input<typeof newsletterSchema>;
