"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/schemas/checkout";
import { useCartStore, cartTotalCents } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { useLocaleStore } from "@/store/locale-store";

type Result = { orderId: string; total: number } | null;

/** Checkout form: validates with zod, posts to /api/checkout, clears cart. */
export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const country = useLocaleStore((s) => s.country);

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: country.code },
  });

  if (!mounted) return null;

  if (result) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-3 text-3xl font-black uppercase">Order confirmed</h1>
        <p className="text-ink-soft">
          Order <span className="font-mono">{result.orderId}</span> ·{" "}
          {formatPrice(result.total, country.currency, country.locale)}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase">Your cart is empty</h1>
        <Link
          href="/category/all"
          className="inline-flex rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const total = cartTotalCents(items);
  const currency = items[0]?.currency ?? "EUR";

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
      setServerError("Something went wrong. Please check your details.");
      return;
    }

    const json = (await res.json()) as { orderId: string; total: number };
    clear();
    setResult(json);
  });

  const field =
    "w-full rounded border border-stone px-3 py-2 text-sm focus:border-ink focus:outline-none";

  return (
    <div className="container-page grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <h1 className="text-3xl font-black uppercase">Checkout</h1>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Email</label>
          <input className={field} type="email" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Full name
          </label>
          <input className={field} {...register("fullName")} />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Address
          </label>
          <input className={field} {...register("address")} />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">City</label>
            <input className={field} {...register("city")} />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">
              Postal code
            </label>
            <input className={field} {...register("postalCode")} />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-red-600">
                {errors.postalCode.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Country
          </label>
          <input className={field} {...register("country")} />
          {errors.country && (
            <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
          )}
        </div>

        <div className="rounded-xl border border-stone bg-mist/40 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide">
            Payment · demo card
          </p>
          <p className="mb-4 text-xs text-ink-soft">
            No real payment is taken. Try <code>4242 4242 4242 4242</code>, any
            future expiry and any CVC.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Name on card
              </label>
              <input className={field} {...register("cardName")} />
              {errors.cardName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.cardName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Card number
              </label>
              <input
                className={field}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                {...register("cardNumber")}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">
                  Expiry (MM/YY)
                </label>
                <input
                  className={field}
                  placeholder="04/29"
                  {...register("cardExpiry")}
                />
                {errors.cardExpiry && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.cardExpiry.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">
                  CVC
                </label>
                <input
                  className={field}
                  inputMode="numeric"
                  placeholder="123"
                  {...register("cardCvc")}
                />
                {errors.cardCvc && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.cardCvc.message}
                  </p>
                )}
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
          {isSubmitting ? "Processing payment…" : "Pay & place order"}
        </button>
      </form>

      <aside className="h-fit rounded border border-stone p-6">
        <h2 className="mb-4 text-lg font-black uppercase">Order summary</h2>
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
                {formatPrice(
                  i.unitPriceCents * i.quantity,
                  i.currency,
                  country.locale,
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 font-bold">
          <span>Total</span>
          <span>{formatPrice(total, currency, country.locale)}</span>
        </div>
      </aside>
    </div>
  );
}
