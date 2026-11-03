"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  POSTAL_CODE_RULES,
  type CheckoutInput,
  type CheckoutOutput,
} from "@/schemas/checkout";
import { citiesForCountry, formatCityInput } from "@/lib/city";
import { useCartStore, cartTotalCents } from "@/store/cart-store";
import { BASE_CURRENCY, formatPriceIn } from "@/lib/format";
import { COUNTRIES, useLocaleStore } from "@/store/locale-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";
import { Consent } from "@/components/ui/Consent";
import { cn } from "@/lib/cn";

export type CheckoutOptions = {
  /** ЮKassa is configured — offer "pay online". */
  onlinePayment: boolean;
  /** Pickup point; empty = pickup is not offered. */
  pickupAddress: string;
  /** Delivery terms from the store settings. */
  deliveryNote: string;
  /** Prefill for a signed-in customer. */
  defaultEmail?: string;
  defaultName?: string;
};

/**
 * Checkout: contact details, delivery, payment method and consent. Posts to
 * /api/checkout; the server re-prices every line. Card details are never
 * collected here — online payment happens on ЮKassa's page.
 */
export function CheckoutForm({
  onlinePayment,
  pickupAddress,
  deliveryNote,
  defaultEmail,
  defaultName,
}: CheckoutOptions) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const country = useLocaleStore((s) => s.country);
  const t = useTranslation();

  const mounted = useHydrated();
  const [serverError, setServerError] = useState<string | null>(null);
  // Set right before navigating away, so the "empty cart" screen does not
  // flash between clearing the cart and the next page.
  const [leaving, setLeaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput, unknown, CheckoutOutput>({
    resolver: zodResolver(checkoutSchema),
    // Validate on blur; a field with an error re-validates on every change.
    mode: "onBlur",
    defaultValues: {
      email: defaultEmail ?? "",
      fullName: defaultName ?? "",
      country: country.code as CheckoutInput["country"],
      deliveryMethod: "delivery",
      paymentMethod: onlinePayment ? "online" : "manual",
      city: "",
      address: "",
      postalCode: "",
    },
  });

  const selectedCountry = useWatch({ control, name: "country" });
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const postalRule = POSTAL_CODE_RULES[selectedCountry] ?? POSTAL_CODE_RULES.RU;
  const isPickup = deliveryMethod === "pickup";

  // Changing the country invalidates the city suggestions, so the field is
  // cleared along with any error it was showing.
  const countryField = register("country");
  const countryProps = {
    ...countryField,
    onChange: (e: ChangeEvent<HTMLSelectElement>) => {
      resetField("city", { defaultValue: "" });
      return countryField.onChange(e);
    },
  };

  const cityField = register("city");
  const cityProps = {
    ...cityField,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      e.target.value = formatCityInput(e.target.value);
      return cityField.onChange(e);
    },
  };

  type FieldName = keyof CheckoutInput;

  /** aria-invalid + link to the error message under the input. */
  const describe = (name: FieldName) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` }
      : {};

  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
        {errors[name]?.message}
      </p>
    ) : null;

  if (!mounted) return null;

  if (items.length === 0 && !leaving) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase">
          {t("cart.emptyCart")}
        </h1>
        <Link
          href="/category/all"
          className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
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
    let res: Response;
    try {
      res = await fetch("/api/checkout", {
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
    } catch {
      setServerError(t("errors.server"));
      return;
    }

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      // 409 carries a specific, already-localized reason (a product was
      // removed or is sold on request) — show it verbatim.
      setServerError(
        res.status === 409 && json.error
          ? json.error
          : t(errorKeyForStatus(res.status)),
      );
      return;
    }

    const json = (await res.json()) as {
      orderId: string;
      paymentUrl: string | null;
    };
    setLeaving(true);
    clear();
    if (json.paymentUrl) {
      window.location.assign(json.paymentUrl);
    } else {
      router.replace(`/checkout/result?order=${encodeURIComponent(json.orderId)}`);
    }
  });

  const field =
    "w-full rounded-lg border border-stone bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent/40 aria-invalid:border-red-600";
  const label = "mb-1 block text-xs font-bold uppercase";
  const card = "space-y-4 rounded-2xl border border-stone p-5 sm:p-6";

  const optionCard = (active: boolean) =>
    cn(
      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition",
      active ? "border-ink bg-mist" : "border-stone hover:border-ink-soft",
    );

  return (
    <div className="container-page grid flex-1 gap-8 py-10 lg:grid-cols-[1fr_24rem] lg:gap-10">
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <h1 className="text-3xl font-black uppercase">{t("checkout.checkout")}</h1>

        {/* Contacts */}
        <section className={card}>
          <h2 className="text-lg font-black uppercase">{t("checkout.contacts")}</h2>
          <div>
            <label htmlFor="fullName" className={label}>
              {t("checkout.fullName")}
            </label>
            <input
              id="fullName"
              className={field}
              autoComplete="name"
              {...describe("fullName")}
              {...register("fullName")}
            />
            {fieldError("fullName")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={label}>
                {t("checkout.phone")}
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                className={field}
                autoComplete="tel"
                placeholder="+7 900 000-00-00"
                {...describe("phone")}
                {...register("phone")}
              />
              {fieldError("phone")}
            </div>
            <div>
              <label htmlFor="email" className={label}>
                {t("checkout.email")}
              </label>
              <input
                id="email"
                className={field}
                type="email"
                autoComplete="email"
                {...describe("email")}
                {...register("email")}
              />
              {fieldError("email")}
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className={card}>
          <h2 className="text-lg font-black uppercase">{t("checkout.delivery")}</h2>
          {pickupAddress ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={optionCard(!isPickup)}>
                <input
                  type="radio"
                  value="delivery"
                  className="mt-0.5 accent-ink"
                  {...register("deliveryMethod")}
                />
                <span className="font-bold">{t("checkout.deliveryCourier")}</span>
              </label>
              <label className={optionCard(isPickup)}>
                <input
                  type="radio"
                  value="pickup"
                  className="mt-0.5 accent-ink"
                  {...register("deliveryMethod")}
                />
                <span className="font-bold">{t("checkout.deliveryPickup")}</span>
              </label>
            </div>
          ) : (
            <input type="hidden" value="delivery" {...register("deliveryMethod")} />
          )}

          {isPickup ? (
            <p className="rounded-xl bg-mist p-4 text-sm">
              {t("checkout.pickupFrom", { address: pickupAddress })}
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className={label}>
                    {t("checkout.country")}
                  </label>
                  <select
                    id="country"
                    className={field}
                    autoComplete="country"
                    {...describe("country")}
                    {...countryProps}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldError("country")}
                </div>
                <div>
                  <label htmlFor="city" className={label}>
                    {t("checkout.city")}
                  </label>
                  <input
                    id="city"
                    className={field}
                    autoComplete="address-level2"
                    list="city-suggestions"
                    {...describe("city")}
                    {...cityProps}
                  />
                  {/* Native combobox: the browser filters options as the user
                      types. Hand-typed cities are fine too. */}
                  <datalist id="city-suggestions">
                    {citiesForCountry(selectedCountry).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {fieldError("city")}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
                <div>
                  <label htmlFor="address" className={label}>
                    {t("checkout.address")}
                  </label>
                  <input
                    id="address"
                    className={field}
                    autoComplete="street-address"
                    placeholder={t("checkout.addressHint")}
                    {...describe("address")}
                    {...register("address")}
                  />
                  {fieldError("address")}
                </div>
                <div>
                  <label htmlFor="postalCode" className={label}>
                    {t("checkout.postalOptional")}
                  </label>
                  <input
                    id="postalCode"
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
              {deliveryNote && (
                <p className="text-xs text-ink-soft">{deliveryNote}</p>
              )}
            </>
          )}

          <div>
            <label htmlFor="comment" className={label}>
              {t("checkout.comment")}
            </label>
            <textarea
              id="comment"
              rows={3}
              className={field}
              placeholder={t("checkout.commentHint")}
              {...describe("comment")}
              {...register("comment")}
            />
            {fieldError("comment")}
          </div>
        </section>

        {/* Payment */}
        <section className={card}>
          <h2 className="text-lg font-black uppercase">
            {t("checkout.paymentMethod")}
          </h2>
          <div className="space-y-3">
            {onlinePayment && (
              <label className={optionCard(paymentMethod === "online")}>
                <input
                  type="radio"
                  value="online"
                  className="mt-1 accent-ink"
                  {...register("paymentMethod")}
                />
                <span>
                  <span className="block font-bold">{t("checkout.payOnline")}</span>
                  <span className="mt-1 block text-xs text-ink-soft">
                    {t("checkout.payOnlineHint")}
                  </span>
                </span>
              </label>
            )}
            <label className={optionCard(paymentMethod === "manual")}>
              <input
                type="radio"
                value="manual"
                className="mt-1 accent-ink"
                {...register("paymentMethod")}
              />
              <span>
                <span className="block font-bold">{t("checkout.payManual")}</span>
                <span className="mt-1 block text-xs text-ink-soft">
                  {t("checkout.payManualHint")}
                </span>
              </span>
            </label>
          </div>
        </section>

        <Consent
          id="checkout-consent"
          registration={register("consent")}
          error={errors.consent}
        />

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || leaving}
          className="hover-lift w-full rounded-full bg-accent px-6 py-4 text-sm font-bold uppercase text-ink hover:bg-accent-strong disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {isSubmitting || leaving
            ? t("checkout.processing")
            : paymentMethod === "online"
              ? t("checkout.placeOrderPay")
              : t("checkout.placeOrder")}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-2xl border border-stone p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-black uppercase">
          {t("checkout.orderSummary")}
        </h2>
        <ul className="space-y-3 border-b border-stone pb-4 text-sm">
          {items.map((i) => (
            <li
              key={`${i.productId}-${i.variantId ?? "_"}`}
              className="flex justify-between gap-4"
            >
              <span className="min-w-0">
                {i.name}
                {i.variantName ? (
                  <span className="text-ink-soft"> · {i.variantName}</span>
                ) : null}{" "}
                <span className="whitespace-nowrap text-ink-soft">× {i.quantity}</span>
              </span>
              <span className="whitespace-nowrap">
                {formatPriceIn(i.unitPriceCents * i.quantity, i.currency, country)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold">
          <span>{t("checkout.total")}</span>
          <span>{formatPriceIn(total, currency, country)}</span>
        </div>
        <p className="text-xs text-ink-soft">{t("checkout.deliveryCostNote")}</p>
        {country.currency !== currency && (
          <p className="text-xs text-ink-soft">{t("checkout.currencyNote")}</p>
        )}
      </aside>
    </div>
  );
}
