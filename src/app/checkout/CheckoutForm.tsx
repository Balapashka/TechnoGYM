"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  POSTAL_CODE_RULES,
  type CheckoutInput,
  type CheckoutOutput,
} from "@/schemas/checkout";
import { formatCardNumber, formatExpiry, digitsOnly } from "@/lib/card";
import { useCartStore, cartTotalCents } from "@/store/cart-store";
import { BASE_CURRENCY, formatPriceIn } from "@/lib/format";
import { COUNTRIES, useLocaleStore } from "@/store/locale-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useTranslation } from "@/i18n/useTranslation";

/** Order currency is captured here because the cart is cleared on success. */
type Result = { orderId: string; total: number; currency: string } | null;

/** Checkout form: validates with zod, posts to /api/checkout, clears cart. */
export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const country = useLocaleStore((s) => s.country);
  const t = useTranslation();

  const mounted = useHydrated();
  const [result, setResult] = useState<Result>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput, unknown, CheckoutOutput>({
    resolver: zodResolver(checkoutSchema),
    // Validate on blur; a field with an error re-validates on every change.
    mode: "onBlur",
    defaultValues: { country: country.code as CheckoutInput["country"] },
  });

  const selectedCountry = useWatch({ control, name: "country" });
  const postalRule = POSTAL_CODE_RULES[selectedCountry] ?? POSTAL_CODE_RULES.RU;

  /** aria-invalid + link to the error message under the input. */
  const describe = (name: keyof CheckoutInput) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` }
      : {};

  const fieldError = (name: keyof CheckoutInput) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
        {errors[name]?.message}
      </p>
    ) : null;

  // Masked inputs: rewrite the value in place, then let RHF's handler read it.
  const masked = (
    name: "cardNumber" | "cardExpiry" | "cardCvc" | "cardName",
    format: (value: string) => string,
  ) => {
    const reg = register(name);
    return {
      ...reg,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        e.target.value = format(e.target.value);
        return reg.onChange(e);
      },
    };
  };

  if (!mounted) return null;

  if (result) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-3 text-3xl font-black uppercase">
          {t("checkout.orderConfirmed")}
        </h1>
        <p className="text-ink-soft">
          {t("checkout.orderLabel")}{" "}
          <span className="font-mono">{result.orderId}</span> ·{" "}
          {formatPriceIn(result.total, result.currency, country)}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("checkout.backToHome")}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase">
          {t("cart.emptyCart")}
        </h1>
        <Link
          href="/category/all"
          className="inline-flex rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("cart.browseProducts")}
        </Link>
      </div>
    );
  }

  const total = cartTotalCents(items);
  const currency = items[0]?.currency ?? BASE_CURRENCY;

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: data,
        currency,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
        })),
      }),
    });

    if (!res.ok) {
      setServerError(t("checkout.serverError"));
      return;
    }

    const json = (await res.json()) as { orderId: string; total: number };
    clear();
    setResult({ ...json, currency });
  });

  const field =
    "w-full rounded border border-stone px-3 py-2 text-sm focus:border-ink focus:outline-none aria-invalid:border-red-600";

  return (
    <div className="container-page grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <h1 className="text-3xl font-black uppercase">{t("checkout.checkout")}</h1>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("checkout.email")}
          </label>
          <input
            className={field}
            type="email"
            autoComplete="email"
            {...describe("email")}
            {...register("email")}
          />
          {fieldError("email")}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("checkout.fullName")}
          </label>
          <input
            className={field}
            autoComplete="name"
            {...describe("fullName")}
            {...register("fullName")}
          />
          {fieldError("fullName")}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("checkout.address")}
          </label>
          <input
            className={field}
            autoComplete="street-address"
            {...describe("address")}
            {...register("address")}
          />
          {fieldError("address")}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">
              {t("checkout.city")}
            </label>
            <input
              className={field}
              autoComplete="address-level2"
              {...describe("city")}
              {...register("city")}
            />
            {fieldError("city")}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">
              {t("checkout.postalCode")}
            </label>
            <input
              className={field}
              autoComplete="postal-code"
              placeholder={postalRule.hint}
              maxLength={7}
              {...describe("postalCode")}
              {...register("postalCode")}
            />
            {fieldError("postalCode")}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("checkout.country")}
          </label>
          <select
            className={field}
            autoComplete="country"
            {...describe("country")}
            {...register("country")}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError("country")}
        </div>

        <div className="rounded-xl border border-stone bg-mist/40 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide">
            {t("checkout.paymentDemoCard")}
          </p>
          <p className="mb-4 text-xs text-ink-soft">
            {t("checkout.demoCardHint")}
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                {t("checkout.nameOnCard")}
              </label>
              <input
                className={`${field} uppercase`}
                autoComplete="cc-name"
                placeholder="IVAN PETROV"
                {...describe("cardName")}
                {...masked("cardName", (v) => v.toUpperCase())}
              />
              {fieldError("cardName")}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                {t("checkout.cardNumber")}
              </label>
              <input
                className={field}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                {...describe("cardNumber")}
                {...masked("cardNumber", formatCardNumber)}
              />
              {fieldError("cardNumber")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">
                  {t("checkout.expiryDate")}
                </label>
                <input
                  className={field}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="04/29"
                  maxLength={5}
                  {...describe("cardExpiry")}
                  {...masked("cardExpiry", formatExpiry)}
                />
                {fieldError("cardExpiry")}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">
                  {t("checkout.cvc")}
                </label>
                <input
                  className={field}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  {...describe("cardCvc")}
                  {...masked("cardCvc", (v) => digitsOnly(v).slice(0, 4))}
                />
                {fieldError("cardCvc")}
              </div>
            </div>
          </div>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50"
        >
          {isSubmitting ? t("checkout.processing") : t("checkout.placeOrder")}
        </button>
      </form>

      <aside className="h-fit rounded border border-stone p-6">
        <h2 className="mb-4 text-lg font-black uppercase">
          {t("checkout.orderSummary")}
        </h2>
        <ul className="space-y-2 border-b border-stone pb-3 text-sm">
          {items.map((i) => (
            <li
              key={`${i.productId}-${i.variantId ?? "_"}`}
              className="flex justify-between"
            >
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>
                {formatPriceIn(
                  i.unitPriceCents * i.quantity,
                  i.currency,
                  country,
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 font-bold">
          <span>{t("checkout.total")}</span>
          <span>{formatPriceIn(total, currency, country)}</span>
        </div>
      </aside>
    </div>
  );
}
