import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
