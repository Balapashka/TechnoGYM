"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";

/** Account registration. Creates a USER and starts a session. */
export function RegisterForm() {
  const router = useRouter();
  const t = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/account");
      router.refresh();
    } else {
      setServerError(t(errorKeyForStatus(res.status)));
    }
  });

  return (
    <AuthCard
      title={t("auth.signUp")}
      subtitle={t("auth.registerLead")}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("auth.name")}
          </label>
          <input className={field} {...register("name")} />
          {errors.name && <p className={fieldError}>{errors.name.message}</p>}
        </div>
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
          {isSubmitting ? t("common.loading") : t("auth.signUp")}
        </button>

        <p className="text-center text-sm text-ink-soft">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-bold text-ink underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
