"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/login";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";

/** Login form. Verifies via /api/auth/login and starts a session. */
export function LoginForm() {
  const router = useRouter();
  const t = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(json.role === "ADMIN" ? "/admin" : "/account");
      router.refresh();
    } else {
      setServerError(t(errorKeyForStatus(res.status)));
    }
  });

  return (
    <AuthCard
      title={t("auth.signIn")}
      subtitle={t("auth.welcomeBack")}
    >
      <div className="mb-4 space-y-2 rounded-lg bg-mist p-3 text-xs text-ink-soft">
        <p>
          {t("auth.demoShopper")} — <strong>demo@movigym.test</strong> / <strong>demo1234</strong>
        </p>
        <p>
          {t("auth.demoAdmin")} — <strong>admin@movigym.test</strong> / <strong>admin1234</strong>
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.email")}
          </label>
          <input className={field} type="email" {...register("email")} />
          {errors.email && <p className={fieldError}>{errors.email.message}</p>}
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

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift w-full rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
        >
          {isSubmitting ? t("common.loading") : t("auth.signIn")}
        </button>

        <div className="flex justify-between text-sm text-ink-soft">
          <Link href="/forgot-password" className="underline hover:text-ink">
            {t("auth.forgotPassword")}
          </Link>
          <Link href="/register" className="font-bold text-ink underline">
            {t("auth.signUp")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
