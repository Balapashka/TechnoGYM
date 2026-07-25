"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema, type ResetInput } from "@/schemas/auth";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";

/** Step 2 of the local reset flow: set a new password with the token. */
export function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: params.get("token") ?? "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1400);
    } else {
      setServerError(t(errorKeyForStatus(res.status)));
    }
  });

  if (done) {
    return (
      <AuthCard title={t("auth.passwordUpdated")} subtitle={t("common.loading")}>
        <p className="text-sm text-green-700">
          {t("auth.passwordUpdatedBody")}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.resetPassword")}
      subtitle={t("auth.resetLead")}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.resetToken")}
          </label>
          <input className={field} {...register("token")} />
          {errors.token && <p className={fieldError}>{errors.token.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.password")}
          </label>
          <input className={field} type="password" {...register("password")} />
          {errors.password && (
            <p className={fieldError}>{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.confirmPassword")}
          </label>
          <input className={field} type="password" {...register("confirm")} />
          {errors.confirm && (
            <p className={fieldError}>{errors.confirm.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift w-full rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
        >
          {isSubmitting ? t("common.loading") : t("auth.resetPassword")}
        </button>

        <p className="text-center text-sm text-ink-soft">
          <Link href="/login" className="font-bold text-ink underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
