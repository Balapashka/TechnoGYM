"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/schemas/newsletter";

/** Footer newsletter signup. Validated with zod; submission is mocked. */
export function NewsletterForm() {
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
          placeholder="Your email"
          aria-label="Email"
          {...register("email")}
          className="w-full rounded-l border border-white/20 bg-white/10 px-3 py-2 text-sm text-paper placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-r bg-accent px-4 text-sm font-bold uppercase text-ink"
        >
          Go
        </button>
      </div>
      {errors.email && (
        <p className="text-xs text-accent">{errors.email.message}</p>
      )}
      {isSubmitSuccessful && !errors.email && (
        <p className="text-xs text-white/70">Thanks for subscribing!</p>
      )}
    </form>
  );
}
