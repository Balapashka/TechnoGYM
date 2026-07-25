"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema, type ForgotInput } from "@/schemas/auth";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";

/** Step 1 of the local reset flow: request a token (shown on-screen in demo). */
export function ForgotForm() {
  const t = useTranslation();
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = handleSubmit(async (data) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setMessage(json.message ?? null);
    setToken(json.token ?? null);
  });

  return (
    <AuthCard
      title={t("auth.resetPassword")}
      subtitle={t("auth.forgotLead")}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.email")}
          </label>
          <input className={field} type="email" {...register("email")} />
          {errors.email && <p className={fieldError}>{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift w-full rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
        >
          {isSubmitting ? t("common.loading") : t("auth.resetPassword")}
        </button>

        {message && <p className="text-sm text-ink-soft">{message}</p>}

        {token && (
          <div className="space-y-2 rounded-lg bg-mist p-3 text-xs">
            <p className="font-bold uppercase">{t("auth.demoToken")}</p>
            <code className="block break-all rounded bg-paper p-2">{token}</code>
            <Link
              href={`/reset-password?token=${token}`}
              className="inline-block font-bold text-ink underline"
            >
              {t("auth.continueToReset")}
            </Link>
          </div>
        )}
      </form>
    </AuthCard>
  );
}
