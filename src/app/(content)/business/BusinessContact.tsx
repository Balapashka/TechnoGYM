"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { field, fieldError } from "@/components/auth/AuthCard";
import { useTranslation } from "@/i18n/useTranslation";

type Form = { company: string; name: string; email: string; message: string };
type Errors = Partial<Record<keyof Form, string>>;

/** "Write us a letter" demo contact form. Validates locally; no real send. */
export function BusinessContact() {
  const t = useTranslation();
  const [form, setForm] = useState<Form>({
    company: "",
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (form.company.trim().length < 2)
      next.company = t("business.errCompany");
    if (form.name.trim().length < 2) next.name = t("business.errName");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      next.email = t("business.errEmail");
    if (form.message.trim().length < 10)
      next.message = t("business.errMessage");
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  const benefits = [
    { title: "business.benefitPricing", body: "business.benefitPricingBody" },
    { title: "business.benefitService", body: "business.benefitServiceBody" },
    { title: "business.benefitContact", body: "business.benefitContactBody" },
  ];

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-800 to-slate-900 text-paper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,237,0,0.2),transparent_55%)]" />
        <div className="container-page relative py-24">
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
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center"
                >
                  <p className="text-2xl font-black uppercase">
                    {t("business.sent")}
                  </p>
                  <p className="mt-2 text-ink-soft">
                    {t("business.sentBody", { name: form.name })}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-xl font-black uppercase">
                    {t("business.writeUs")}
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase">
                        {t("business.company")}
                      </label>
                      <input
                        className={field}
                        aria-label={t("business.company")}
                        value={form.company}
                        onChange={(e) => set("company", e.target.value)}
                      />
                      {errors.company && (
                        <p className={fieldError}>{errors.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase">
                        {t("business.yourName")}
                      </label>
                      <input
                        className={field}
                        aria-label={t("business.yourName")}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                      {errors.name && <p className={fieldError}>{errors.name}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase">
                      {t("auth.email")}
                    </label>
                    <input
                      type="email"
                      className={field}
                      aria-label={t("auth.email")}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                    {errors.email && <p className={fieldError}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase">
                      {t("business.message")}
                    </label>
                    <textarea
                      rows={5}
                      className={field}
                      aria-label={t("business.message")}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                    {errors.message && (
                      <p className={fieldError}>{errors.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="hover-lift rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase text-ink"
                  >
                    {t("business.send")}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
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
