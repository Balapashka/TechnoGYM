"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LeadForm } from "@/components/shop/LeadForm";
import { phoneHref, socialLinksFrom, type StoreSettings } from "@/lib/settings-shape";

/**
 * Client-side pieces of the generic info page. InfoPage itself stays a server
 * component, so the translated bits live here.
 */

export function InfoUpdated({ date }: { date: string }) {
  const t = useTranslation();
  return <p className="mt-3 text-xs text-ink-soft">{t("info.updated", { date })}</p>;
}

/** Phone, email, address, hours, messengers and legal details. */
export function InfoContacts({ settings: s }: { settings: StoreSettings }) {
  const t = useTranslation();
  const socials = socialLinksFrom(s);
  const row = "border-b border-stone py-4";
  const label = "text-xs font-bold uppercase tracking-widest text-ink-soft";

  return (
    <section>
      <h2 className="mb-2 text-xl font-black uppercase">{t("info.contactUs")}</h2>
      <dl>
        {s.phone && (
          <div className={row}>
            <dt className={label}>{t("info.phone")}</dt>
            <dd className="mt-1 text-2xl font-black">
              <a href={phoneHref(s.phone)} className="hover:underline">
                {s.phone}
              </a>
            </dd>
          </div>
        )}
        {s.email && (
          <div className={row}>
            <dt className={label}>{t("info.email")}</dt>
            <dd className="mt-1 break-all text-lg font-bold">
              <a href={`mailto:${s.email}`} className="hover:underline">
                {s.email}
              </a>
            </dd>
          </div>
        )}
        {s.workingHours && (
          <div className={row}>
            <dt className={label}>{t("info.hours")}</dt>
            <dd className="mt-1">{s.workingHours}</dd>
          </div>
        )}
        {s.address && (
          <div className={row}>
            <dt className={label}>{t("info.address")}</dt>
            <dd className="mt-1">{s.address}</dd>
          </div>
        )}
        {socials.length > 0 && (
          <div className={row}>
            <dt className={label}>{t("info.messengers")}</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {socials.map((l) => (
                <a
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-lift rounded-full border border-ink px-4 py-1.5 text-xs font-bold uppercase"
                >
                  {l.label}
                </a>
              ))}
            </dd>
          </div>
        )}
        {s.legalName && (
          <div className="py-4">
            <dt className={label}>{t("info.requisites")}</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              {[
                s.legalName,
                s.inn && `ИНН ${s.inn}`,
                s.ogrn && `ОГРН ${s.ogrn}`,
                s.legalAddress,
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export function InfoContactForm() {
  const t = useTranslation();
  return (
    <div className="rounded-2xl border border-stone p-6 sm:p-8">
      <LeadForm source="contact" subject="Обращение с сайта" title={t("info.writeUs")} />
    </div>
  );
}
