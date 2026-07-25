"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { AuthCard, field, fieldError } from "@/components/auth/AuthCard";

/** Account registration. Creates a USER and starts a session. */
export function RegisterForm() {
  const router = useRouter();
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
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push("/account");
      router.refresh();
    } else {
      setServerError(json.error ?? "Could not create the account");
    }
  });

  return (
    <AuthCard
      title="Create account"
      subtitle="Join the demo store to track orders and check out faster."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Name</label>
          <input className={field} {...register("name")} />
          {errors.name && <p className={fieldError}>{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Email</label>
          <input className={field} type="email" {...register("email")} />
          {errors.email && <p className={fieldError}>{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Password
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
          {isSubmitting ? "Creating…" : "Create account"}
        </button>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ink underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
