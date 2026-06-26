"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema, type ResetInput } from "@/schemas/auth";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";

/** Step 2 of the local reset flow: set a new password with the token. */
export function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
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
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1400);
    } else {
      setServerError(json.error ?? "Could not reset the password");
    }
  });

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="Redirecting to login…">
        <p className="text-sm text-green-700">
          Your password has been changed. You can now sign in.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Paste your reset token and choose a new password."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Reset token
          </label>
          <input className={field} {...register("token")} />
          {errors.token && <p className={fieldError}>{errors.token.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            New password
          </label>
          <input className={field} type="password" {...register("password")} />
          {errors.password && (
            <p className={fieldError}>{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Confirm password
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
          {isSubmitting ? "Updating…" : "Update password"}
        </button>

        <p className="text-center text-sm text-ink-soft">
          <Link href="/login" className="font-bold text-ink underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
