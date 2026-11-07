import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/catalog";
import { brandSlug } from "@/lib/catalog-url";
import { BRAND_PAGES, getBrandPage } from "@/lib/brand-pages";
import { ProductCard } from "@/components/shop/ProductCard";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return BRAND_PAGES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = getBrandPage((await params).slug);
  if (!page) return { title: "Бренд не найден — SPORT LINER" };
  return {
    title: `${page.title} | SPORT LINER`,
    description: page.description,
    alternates: { canonical: `/brand/${page.slug}` },
    openGraph: { title: page.title, description: page.description, url: `/brand/${page.slug}` },
  };
}

/** Brand landing: SEO text, every model of the brand, FAQ. */
export default async function BrandPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = getBrandPage((await params).slug);
  if (!page) notFound();
  const products = (await getAllProducts()).filter((p) => brandSlug(p.brand) === page.slug);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: page.brand, item: `${SITE_URL}/brand/${page.slug}` },
    ],
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqLd, breadcrumbLd]).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-stone bg-mist">
        <div className="container-page py-14 md:py-20">
          <nav className="mb-6 text-xs text-ink-soft">
            <Link href="/" className="hover:text-ink">
              Главная
            </Link>{" "}
            / <span className="text-ink">{page.brand}</span>
          </nav>
          <h1 className="max-w-4xl text-3xl font-semibold uppercase leading-tight md:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{page.lead}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink-soft">
            {products.length} моделей в каталоге
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container-page grid gap-12 border-t border-stone py-16 lg:grid-cols-2">
        <div>
          <h2 className="mb-5 text-2xl font-semibold uppercase">О бренде {page.brand}</h2>
          <div className="space-y-4 text-ink-soft">
            {page.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-semibold uppercase">Частые вопросы</h2>
          <dl className="divide-y divide-stone border-y border-stone">
            {page.faq.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/contact"
            className="hover-lift mt-8 inline-flex rounded-full bg-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper"
          >
            Получить консультацию
          </Link>
        </div>
      </section>
    </main>
  );
}
