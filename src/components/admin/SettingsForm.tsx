"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/schemas/settings";
import { field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";
import type { SettingsKey, StoreSettings } from "@/lib/settings-shape";
import { REQUIRED_FOR_LAUNCH } from "@/lib/settings-shape";

const GROUPS: { title: string; keys: SettingsKey[]; multiline?: SettingsKey[] }[] = [
  {
    title: "admin.settingsContacts",
    keys: ["phone", "email", "workingHours", "address"],
  },
  {
    title: "admin.settingsLegal",
    keys: ["legalName", "inn", "ogrn", "legalAddress"],
  },
  {
    title: "admin.settingsDelivery",
    keys: ["pickupAddress", "deliveryNote"],
    multiline: ["deliveryNote"],
  },
  {
    title: "admin.settingsSocial",
    keys: ["telegram", "whatsapp", "vk", "youtube"],
  },
  {
    title: "admin.settingsSeo",
    keys: ["yandexVerification", "googleVerification", "yandexMetrikaId"],
  },
];

/** Store contacts, legal details and socials (saved to the Setting table). */
export function SettingsForm({ initial }: { initial: StoreSettings }) {
  const t = useTranslation();
  const router = useRouter();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });

  const indexable = useWatch({ control, name: "seoIndexable" }) === "true";

  const onSubmit = handleSubmit(async (data) => {
    setStatus(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res?.ok) {
      setStatus({ ok: true, text: t("admin.saved") });
      router.refresh();
    } else {
      setStatus({ ok: false, text: t(errorKeyForStatus(res?.status ?? 500)) });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-black uppercase">{t("admin.settings")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t("admin.settingsLead")}</p>
      </div>

      {GROUPS.map((g) => (
        <fieldset key={g.title} className="space-y-4 rounded-2xl border border-stone p-5">
          <legend className="px-2 text-sm font-black uppercase">{t(g.title)}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.keys.map((key) => {
              const multiline = g.multiline?.includes(key);
              const required = REQUIRED_FOR_LAUNCH.includes(key);
              return (
                <div key={key} className={multiline ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`s-${key}`} className="mb-1 block text-xs font-bold uppercase">
                    {t(`admin.setting_${key}`)}
                    {required && <span className="text-red-600"> *</span>}
                  </label>
                  {multiline ? (
                    <textarea id={`s-${key}`} rows={3} className={field} {...register(key)} />
                  ) : (
                    <input id={`s-${key}`} className={field} {...register(key)} />
                  )}
                  {errors[key] && <p className={fieldError}>{errors[key]?.message}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <label className="flex max-w-3xl items-start gap-3 rounded-2xl border border-stone p-5 text-sm">
        <input
          type="checkbox"
          checked={indexable}
          onChange={(e) =>
            setValue("seoIndexable", e.target.checked ? "true" : "", { shouldDirty: true })
          }
          className="mt-1 h-4 w-4 accent-ink"
        />
        <span>
          <span className="block font-bold">{t("admin.seoIndexable")}</span>
          <span className="mt-1 block text-ink-soft">{t("admin.seoIndexableHint")}</span>
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-lift rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {isSubmitting ? t("admin.saving") : t("admin.save")}
        </button>
        {status && (
          <p className={status.ok ? "text-sm text-green-700" : "text-sm text-red-600"}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}
