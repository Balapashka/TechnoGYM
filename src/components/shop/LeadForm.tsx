"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";
import { quoteRequestSchema } from "@/schemas/quote";
import { field, fieldError } from "@/components/auth/AuthCard";
import { Consent } from "@/components/ui/Consent";
import { Honeypot } from "@/components/ui/Honeypot";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";

/** Form values: the lead schema plus an optional company for B2B requests. */
const leadFormSchema = quoteRequestSchema.extend({
  company: z.string().trim().max(200).optional(),
});
type LeadInput = z.input<typeof leadFormSchema>;
type LeadOutput = z.output<typeof leadFormSchema>;

/**
 * Contact form that lands in the admin's "Заявки" inbox (and the manager's
 * Telegram / email). Used on /business and /contact.
 */
export function LeadForm({
  source,
  subject,
  withCompany = false,
  title,
}: {
  source: "business" | "contact";
  /** What the lead is about, stored as the request's "product" line. */
  subject: string;
  withCompany?: boolean;
  title: string;
}) {
  const t = useTranslation();
  const [sentName, setSentName] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput, unknown, LeadOutput>({
    resolver: zodResolver(leadFormSchema),
    mode: "onBlur",
    defaultValues: { productName: subject, source },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const { company, ...lead } = data;
    const res = await fetch("/api/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        productName: company ? `${subject}: ${company}` : subject,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      setServerError(
        res?.status === 429 ? t(errorKeyForStatus(429)) : t("checkout.serverError"),
      );
      return;
    }
    setSentName(data.name);
  });

  return (
    <AnimatePresence mode="wait">
      {sentName !== null ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-10 text-center"
        >
          <p className="text-2xl font-black uppercase">{t("business.sent")}</p>
          <p className="mt-2 text-ink-soft">
            {t("business.sentBody", { name: sentName })}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          className="relative space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-black uppercase">{title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {withCompany && (
              <div className="sm:col-span-2">
                <label htmlFor={`${source}-company`} className="mb-1 block text-xs font-bold uppercase">
                  {t("business.company")}
                </label>
                <input
                  id={`${source}-company`}
                  className={field}
                  autoComplete="organization"
                  {...register("company")}
                />
              </div>
            )}
            <div>
              <label htmlFor={`${source}-name`} className="mb-1 block text-xs font-bold uppercase">
                {t("business.yourName")}
              </label>
              <input
                id={`${source}-name`}
                className={field}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
              {errors.name && <p className={fieldError}>{t("business.errName")}</p>}
            </div>
            <div>
              <label htmlFor={`${source}-phone`} className="mb-1 block text-xs font-bold uppercase">
                {t("product.requestPhone")}
              </label>
              <input
                id={`${source}-phone`}
                type="tel"
                inputMode="tel"
                className={field}
                autoComplete="tel"
                placeholder="+7 900 000-00-00"
                aria-invalid={errors.phone ? true : undefined}
                {...register("phone")}
              />
              {errors.phone && (
                <p className={fieldError}>{t("product.requestErrPhone")}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor={`${source}-email`} className="mb-1 block text-xs font-bold uppercase">
              {t("product.requestEmail")}
            </label>
            <input
              id={`${source}-email`}
              type="email"
              className={field}
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
            {errors.email && <p className={fieldError}>{t("business.errEmail")}</p>}
          </div>
          <div>
            <label htmlFor={`${source}-message`} className="mb-1 block text-xs font-bold uppercase">
              {t("business.message")}
            </label>
            <textarea
              id={`${source}-message`}
              rows={5}
              className={field}
              aria-invalid={errors.comment ? true : undefined}
              {...register("comment")}
            />
            {errors.comment && <p className={fieldError}>{errors.comment.message}</p>}
          </div>
          <Consent
            id={`${source}-consent`}
            registration={register("consent")}
            error={errors.consent}
          />
          <Honeypot registration={register("website")} />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="hover-lift rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
          >
            {isSubmitting ? t("common.loading") : t("business.send")}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
