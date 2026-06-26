"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/schemas/product";
import { field, fieldError } from "@/components/auth/AuthCard";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceEuros: number;
  categoryId: string;
  badge: string;
  features: string;
  inStock: boolean;
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
      priceEuros: initial?.priceEuros ?? 0,
      categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
      badge: initial?.badge ?? "",
      features: initial?.features ?? "",
      inStock: initial?.inStock ?? true,
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
      const json = await res.json().catch(() => ({}));
      setServerError(json.error ?? "Could not save the product");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Name</label>
          <input className={field} {...register("name")} />
          {errors.name && <p className={fieldError}>{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Slug (URL)
          </label>
          <input className={field} {...register("slug")} />
          {errors.slug && <p className={fieldError}>{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase">
          Description
        </label>
        <textarea rows={3} className={field} {...register("description")} />
        {errors.description && (
          <p className={fieldError}>{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Price (€)
          </label>
          <input
            type="number"
            step="0.01"
            className={field}
            {...register("priceEuros", { valueAsNumber: true })}
          />
          {errors.priceEuros && (
            <p className={fieldError}>{errors.priceEuros.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">
            Category
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
            Badge (optional)
          </label>
          <input className={field} {...register("badge")} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase">
          Features (one per line)
        </label>
        <textarea rows={4} className={field} {...register("features")} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("inStock")} /> In stock
      </label>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="hover-lift rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
