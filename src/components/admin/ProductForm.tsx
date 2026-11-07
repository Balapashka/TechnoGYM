"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  splitLines,
  type ProductInput,
} from "@/schemas/product";
import { field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";
import { slugify } from "@/lib/slugify";
import { BRAND_PRESETS, brandPreset } from "@/lib/brand-presets";

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
  images: string;
  inStock: boolean;
  priceOnRequest: boolean;
  condition: "new" | "used";
};

/** Create or edit a product. Posts to /api/admin/products[/:id]. */
export function ProductForm({
  categories,
  initial,
  brands = [],
}: {
  categories: Category[];
  initial?: ProductFormValues;
  /** Brands already in the catalog, suggested in the brand field. */
  brands?: string[];
}) {
  const router = useRouter();
  const t = useTranslation();
  const isEdit = Boolean(initial?.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
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
      images: initial?.images ?? "",
      inStock: initial?.inStock ?? true,
      priceOnRequest: initial?.priceOnRequest ?? false,
      condition: initial?.condition ?? "new",
    },
  });

  const imageList = splitLines(useWatch({ control, name: "images" }));
  const priceOnRequest = useWatch({ control, name: "priceOnRequest" });
  const used = useWatch({ control, name: "condition" }) === "used";

  // The URL is generated from the name until the owner edits it by hand
  // (and never changes for an existing product, so links stay stable).
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const nameField = register("name");
  const slugField = register("slug");
  const brandField = register("brand");
  const brandOptions = [
    ...new Set([...BRAND_PRESETS.map((b) => b.name), ...brands]),
  ].sort((a, b) => a.localeCompare(b));

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const body = new FormData();
    for (const f of Array.from(files)) body.append("files", f);
    const res = await fetch("/api/admin/uploads", { method: "POST", body }).catch(
      () => null,
    );
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    if (!res?.ok) {
      const json = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
      setUploadError(json?.error ?? t("admin.errUpload"));
      return;
    }
    const { urls } = (await res.json()) as { urls: string[] };
    // Drop the stock placeholder once a real photo is added.
    const current = splitLines(getValues("images")).filter(
      (u) => !u.startsWith("/placeholders/"),
    );
    setValue("images", [...current, ...urls].join("\n"), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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
          <input
            className={field}
            {...nameField}
            onChange={(e) => {
              nameField.onChange(e);
              if (!slugTouched) {
                setValue("slug", slugify(e.target.value), { shouldValidate: false });
              }
            }}
          />
          {errors.name && <p className={fieldError}>{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            {t("admin.slug")}
          </label>
          <input
            className={`${field} font-mono text-xs`}
            {...slugField}
            onChange={(e) => {
              setSlugTouched(true);
              slugField.onChange(e);
            }}
          />
          <p className="mt-1 text-xs text-ink-soft">{t("admin.slugHint")}</p>
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
            placeholder={priceOnRequest ? "0" : undefined}
            {...register("priceRub", { valueAsNumber: true })}
          />
          {priceOnRequest && (
            <p className="mt-1 text-xs text-ink-soft">{t("admin.priceHiddenHint")}</p>
          )}
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
          <input
            className={field}
            list="brand-options"
            placeholder="Technogym"
            {...brandField}
            onChange={(e) => {
              brandField.onChange(e);
              const preset = brandPreset(e.target.value);
              if (preset) {
                setValue("originCountry", preset.originCountry, { shouldValidate: true });
                // A used unit is on hand and priced, whatever its brand sells like new.
                if (getValues("condition") !== "used") {
                  setValue("inStock", preset.inStock);
                  setValue("priceOnRequest", preset.priceOnRequest, { shouldValidate: true });
                }
              }
            }}
          />
          <datalist id="brand-options">
            {brandOptions.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-ink-soft">{t("admin.brandHint")}</p>
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
        <textarea
          rows={6}
          className={field}
          placeholder={"Макс. вес пользователя: 150 кг\nСкорость: 1–20 км/ч\nБеговое полотно: 140 × 51 см"}
          {...register("features")}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase">
          {t("admin.images")}
        </label>
        {imageList.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {imageList.map((src, i) => (
              <li
                key={`${src}-${i}`}
                className={`h-20 w-20 overflow-hidden rounded-lg border bg-mist ${
                  i === 0 ? "border-ink" : "border-stone"
                }`}
              >
                {/* Plain <img>: arbitrary admin-entered URLs, preview only. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
        <textarea
          rows={3}
          className={`${field} font-mono text-xs`}
          {...register("images")}
        />
        {errors.images && <p className={fieldError}>{errors.images.message}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="hover-lift rounded-full border border-ink px-4 py-2 text-xs font-bold uppercase disabled:opacity-50"
          >
            {uploading ? t("admin.uploading") : t("admin.uploadImages")}
          </button>
          <span className="text-xs text-ink-soft">{t("admin.uploadHint")}</span>
        </div>
        {uploadError && <p className={fieldError}>{uploadError}</p>}
      </div>

      <div className="rounded-xl border border-stone p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={used}
            onChange={(e) => {
              const on = e.target.checked;
              setValue("condition", on ? "used" : "new", { shouldDirty: true });
              if (on) {
                // Used equipment is sold from stock, with its price shown.
                setValue("priceOnRequest", false, { shouldValidate: true });
                setValue("inStock", true);
              }
            }}
          />
          {t("admin.used")}
        </label>
        <p className="mt-1 pl-6 text-xs text-ink-soft">{t("admin.usedHint")}</p>
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
