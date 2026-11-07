"use client";

import { motion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/shop/LeadForm";
import { useTranslation } from "@/i18n/useTranslation";
import { Media } from "@/components/ui/Media";

/** B2B landing: benefits + a request form that lands in the admin inbox. */
export function BusinessContact() {
  const t = useTranslation();
  const benefits = [
    { title: "business.benefitPricing", body: "business.benefitPricingBody" },
    { title: "business.benefitService", body: "business.benefitServiceBody" },
    { title: "business.benefitContact", body: "business.benefitContactBody" },
  ];

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-800 to-slate-900 text-paper">
        <Media src="/media/home-gym.jpg" alt="" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-sky-950/70 to-sky-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,237,0,0.15),transparent_55%)]" />
        <div className="container-page relative py-24 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-bold uppercase tracking-widest text-accent"
          >
            {t("business.eyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="max-w-2xl text-4xl font-black uppercase md:text-6xl"
          >
            {t("business.title")}
          </motion.h1>
          <p className="mt-4 max-w-lg text-white/80">{t("business.lead")}</p>
        </div>
      </section>

      <div className="container-page grid flex-1 gap-12 py-16 lg:grid-cols-[1fr_24rem]">
        <Reveal>
          <div className="rounded-2xl border border-stone p-8">
            <LeadForm
              source="business"
              subject="Для бизнеса"
              withCompany
              title={t("business.writeUs")}
            />
          </div>
        </Reveal>

        <Reveal direction="right">
          <aside className="space-y-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-stone p-6">
                <h3 className="font-black uppercase">{t(b.title)}</h3>
                <p className="mt-1 text-sm text-ink-soft">{t(b.body)}</p>
              </div>
            ))}
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
