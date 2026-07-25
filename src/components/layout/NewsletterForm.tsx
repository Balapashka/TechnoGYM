"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/schemas/newsletter";
import { useTranslation } from "@/i18n/useTranslation";

/** Footer newsletter signup. Validated with zod; submission is mocked. */
export function NewsletterForm() {
  const t = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = handleSubmit(() => {
    // Demo only: no real subscription endpoint.
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <div className="flex">
        <input
          type="email"
          placeholder={t("footer.subscribePlaceholder")}
          aria-label={t("auth.email")}
          {...register("email")}
          className="w-full rounded-l border border-white/20 bg-white/10 px-3 py-2 text-sm text-paper placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-r bg-accent px-4 text-sm font-bold uppercase text-ink"
        >
          {t("newsletter.go")}
        </button>
      </div>
      {errors.email && (
        // The zod messages in @/schemas/newsletter are English; show the
        // localized email error instead of raw `errors.email.message`.
        <p className="text-xs text-accent">{t("business.errEmail")}</p>
      )}
      {isSubmitSuccessful && !errors.email && (
        <p className="text-xs text-white/70">{t("newsletter.thanks")}</p>
      )}
    </form>
  );
}
