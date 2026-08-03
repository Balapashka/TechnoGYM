"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/schemas/product";
import { field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceRub: number;
  brand: string;
  originCountry: string;
  categoryId: string;
  badge: string;
  features: string;
  inStock: boolean;
  priceOnRequest: boolean;
};

/** Create or edit a product. Posts to /api/admin/products[/:id]. */
export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const t = useTranslation();
  const isEdit = Boolean(initial?.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      priceRub: initial?.priceRub ?? 0,
      brand: initial?.brand ?? "",
      originCountry: initial?.originCountry ?? "",
      categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
      badge: initial?.badge ?? "",
      features: initial?.features ?? "",
      inStock: initial?.inStock ?? true,
      priceOnRequest: initial?.priceOnRequest ?? false,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const url = isEdit
      ? `/api/admin/products/${initial!.id}`
      : "/api/admin/products";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
        setServerError(t(errorKeyForStatus(res.status)));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.name")}
          </label>
          <input className={field} {...register("name")} />
          {errors.name && <p className={fieldError}>{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.slug")}
          </label>
          <input className={field} {...register("slug")} />
          {errors.slug && <p className={fieldError}>{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase">
          {t("admin.description")}
        </label>
        <textarea rows={3} className={field} {...register("description")} />
        {errors.description && (
          <p className={fieldError}>{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.price")}
          </label>
          <input
            type="number"
            step="1"
            className={field}
            {...register("priceRub", { valueAsNumber: true })}
          />
          {errors.priceRub && (
            <p className={fieldError}>{errors.priceRub.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.category")}
          </label>
          <select className={field} {...register("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className={fieldError}>{errors.categoryId.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.badgeOptional")}
          </label>
          <input className={field} {...register("badge")} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("product.brand")}
          </label>
          <input className={field} placeholder="Technogym" {...register("brand")} />
          {errors.brand && <p className={fieldError}>{errors.brand.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("product.origin")}
          </label>
          <input
            className={field}
            placeholder="Италия"
            {...register("originCountry")}
          />
          {errors.originCountry && (
            <p className={fieldError}>{errors.originCountry.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase">
          {t("admin.featuresPerLine")}
        </label>
        <textarea rows={4} className={field} {...register("features")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("inStock")} /> {t("admin.inStock")}
        </label>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("priceOnRequest")} />{" "}
            {t("admin.priceOnRequest")}
          </label>
          {/* The price is still stored, it is simply replaced in the
              storefront by the quote label and its CTA. */}
          <p className="mt-1 pl-6 text-xs text-ink-soft">
            {t("product.priceOnRequest")} → {t("product.requestPrice")}
          </p>
        </div>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {isSubmitting
            ? t("admin.saving")
            : isEdit
              ? t("admin.saveChanges")
              : t("admin.createProduct")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="hover-lift rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          {t("admin.cancel")}
        </button>
      </div>
    </form>
  );
}
