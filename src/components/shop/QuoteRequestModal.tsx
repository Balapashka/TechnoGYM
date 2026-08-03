"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
  type QuoteRequestOutput,
} from "@/schemas/quote";
import { field, fieldError } from "@/components/auth/AuthCard";
import { useQuoteStore, type QuoteProduct } from "@/store/quote-store";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Global "request a price" dialog. Products imported to order (Technogym,
 * Panatta) never show a price or an add-to-cart button; every CTA for them
 * opens this modal through the quote store. Mounted once in the layout.
 */
export function QuoteRequestModal() {
  const product = useQuoteStore((s) => s.product);
  const close = useQuoteStore((s) => s.close);
  const t = useTranslation();

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, close]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-title"
              className="pointer-events-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-paper p-6 shadow-2xl sm:rounded-2xl"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.32, ease }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                    {t("product.priceOnRequest")}
                  </p>
                  <h2
                    id="quote-title"
                    className="mt-1 text-xl font-black uppercase"
                  >
                    {t("product.requestPrice")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("common.close")}
                  className="hover-lift grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* Remount per product so a second request starts from a clean form. */}
              <QuoteForm key={product.id} product={product} onClose={close} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Contact form for a single product, plus the thank-you screen after sending. */
function QuoteForm({
  product,
  onClose,
}: {
  product: QuoteProduct;
  onClose: () => void;
}) {
  const t = useTranslation();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const doneRef = useRef<HTMLButtonElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput, unknown, QuoteRequestOutput>({
    resolver: zodResolver(quoteRequestSchema),
    // Validate on blur; a field with an error re-validates on every change.
    mode: "onBlur",
    // The schema validates the whole payload; the product travels with the form
    // values instead of being asked of the visitor.
    defaultValues: { productId: product.id, productName: product.name },
  });

  // Move focus into the dialog, and hand it back to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    nameRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  const nameField = register("name");

  /** aria-invalid + link to the error message under the input. */
  const describe = (name: "name" | "phone" | "email") =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `quote-${name}-error` }
      : {};

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The schema already normalized the phone and dropped empty optionals.
        body: JSON.stringify({
          ...data,
          productId: product.id,
          productName: product.name,
        }),
      });

      if (!res.ok) {
        setServerError(t("checkout.serverError"));
        return;
      }
    } catch {
      // Offline or a dropped connection: same message, the form stays filled in
      // so the visitor can retry.
      setServerError(t("checkout.serverError"));
      return;
    }

    setSent(true);
  });

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease }}
          className="py-8 text-center"
        >
          <p className="text-2xl font-black uppercase">
            {t("product.requestSent")}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {t("product.requestSentBody")}
          </p>
          <button
            ref={doneRef}
            type="button"
            onClick={onClose}
            className="hover-lift mt-6 rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong"
          >
            {t("common.close")}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 space-y-4"
        >
          <p className="text-sm text-ink-soft">{t("product.requestPriceLead")}</p>

          <p className="rounded-lg border border-stone bg-mist px-4 py-3 text-sm font-bold">
            {product.name}
          </p>

          <div>
            <label
              htmlFor="quote-name"
              className="mb-1 block text-xs font-bold uppercase"
            >
              {t("product.requestName")}
            </label>
            <input
              id="quote-name"
              className={field}
              autoComplete="name"
              {...describe("name")}
              {...nameField}
              ref={(el) => {
                nameField.ref(el);
                nameRef.current = el;
              }}
            />
            {errors.name && (
              // The zod messages in @/schemas/quote are not localized; show the
              // translated copy instead of `errors.name.message`.
              <p id="quote-name-error" className={fieldError}>
                {t("product.requestErrName")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="quote-phone"
              className="mb-1 block text-xs font-bold uppercase"
            >
              {t("product.requestPhone")}
            </label>
            <input
              id="quote-phone"
              type="tel"
              inputMode="tel"
              className={field}
              autoComplete="tel"
              placeholder="+7 900 000-00-00"
              {...describe("phone")}
              {...register("phone")}
            />
            {errors.phone && (
              <p id="quote-phone-error" className={fieldError}>
                {t("product.requestErrPhone")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="quote-email"
              className="mb-1 block text-xs font-bold uppercase"
            >
              {t("product.requestEmail")}
            </label>
            <input
              id="quote-email"
              type="email"
              className={field}
              autoComplete="email"
              {...describe("email")}
              {...register("email")}
            />
            {errors.email && (
              <p id="quote-email-error" className={fieldError}>
                {t("product.requestErrEmail")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="quote-comment"
              className="mb-1 block text-xs font-bold uppercase"
            >
              {t("product.requestComment")}
            </label>
            <textarea
              id="quote-comment"
              rows={3}
              className={field}
              aria-invalid={errors.comment ? true : undefined}
              aria-describedby={errors.comment ? "quote-comment-error" : undefined}
              {...register("comment")}
            />
            {/* Without this the 1000-character limit would block submit with
                no visible reason — the button would simply do nothing. */}
            {errors.comment && (
              <p id="quote-comment-error" className={fieldError}>
                {errors.comment.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="hover-lift w-full rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
          >
            {/* Every other form in the project swaps the label while sending;
                a dimmed button alone says nothing to a screen reader. */}
            {isSubmitting ? t("common.loading") : t("product.requestSubmit")}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
