"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/schemas/newsletter";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";
import { Consent } from "@/components/ui/Consent";

/** Footer newsletter signup. Stores the email via /api/subscribe. */
export function NewsletterForm() {
  const t = useTranslation();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (!res?.ok) {
      setServerError(t(errorKeyForStatus(res?.status ?? 500)));
      return;
    }
    reset();
    setDone(true);
  });

  if (done) {
    return <p className="text-sm text-white/80">{t("newsletter.thanks")}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="flex">
        <input
          type="email"
          autoComplete="email"
          placeholder={t("footer.subscribePlaceholder")}
          aria-label={t("auth.email")}
          {...register("email")}
          className="w-full min-w-0 rounded-l border border-white/20 bg-white/10 px-3 py-2 text-sm text-paper placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-r bg-accent px-4 text-sm font-bold uppercase text-ink disabled:opacity-60"
        >
          {t("newsletter.go")}
        </button>
      </div>
      {errors.email && (
        <p className="text-xs text-accent">{t("business.errEmail")}</p>
      )}
      <Consent
        id="newsletter-consent"
        tone="dark"
        registration={register("consent")}
        error={errors.consent}
      >
        {t("legal.consentNewsletter")}{" "}
        <Link href="/privacy" target="_blank" className="underline hover:text-accent">
          {t("legal.privacyLink")}
        </Link>
      </Consent>
      {serverError && <p className="text-xs text-accent">{serverError}</p>}
    </form>
  );
}
