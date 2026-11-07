import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { QuickViewDrawer } from "@/components/shop/QuickViewDrawer";
import { QuoteRequestModal } from "@/components/shop/QuoteRequestModal";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CompareBar } from "@/components/shop/CompareBar";
import { CompareToast } from "@/components/shop/CompareToast";
import { isIndexable, SITE_URL } from "@/lib/site";
import { YandexMetrika } from "@/components/layout/YandexMetrika";
import { BRAND_NAME } from "@/lib/brand";
import { getSettings } from "@/lib/settings";
import { getShopNav } from "@/lib/catalog";

const inter = Inter({
  variable: "--font-sans",
  // The storefront is Russian, so the Cyrillic subset must ship too — without
  // it every Russian glyph falls back to a system font.
  subsets: ["latin", "cyrillic"],
});

/** Wide grotesque for headings — the premium, Technogym-like voice. */
const display = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
});

const title = "SPORT LINER — тренажёры Technogym и UNIX Fit в Москве";
const description =
  "Тренажёры Technogym под заказ из Италии и UNIX Fit в наличии в Москве: беговые дорожки, велотренажёры, эллипсы, силовые тренажёры для дома и фитнес-клубов. Доставка и сборка.";

/**
 * Site-wide metadata. Dynamic because indexing and the webmaster verification
 * codes are owner settings (/admin/settings), not build-time constants.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, indexable] = await Promise.all([getSettings(), isIndexable()]);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // Mirrors robots.txt.
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    verification: {
      ...(settings.googleVerification ? { google: settings.googleVerification } : {}),
      ...(settings.yandexVerification ? { yandex: settings.yandexVerification } : {}),
    },
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      locale: "ru_RU",
      title,
      description,
      url: SITE_URL,
      images: [{ url: "/media/club.jpg", width: 1600, height: 1199 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, nav] = await Promise.all([getSettings(), getShopNav()]);
  return (
    <html lang="ru" className={`${inter.variable} ${display.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <NavigationProgress />
        <MotionProvider>
          <Header />
          {children}
          <Footer settings={settings} nav={nav} />
          <CookieBanner />
          <QuickViewDrawer />
          <QuoteRequestModal />
          <CartDrawer />
          <CompareBar />
          <CompareToast />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: BRAND_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/sportliner-logo.png`,
              image: `${SITE_URL}/media/club.jpg`,
              ...(settings.phone ? { telephone: settings.phone } : {}),
              ...(settings.email ? { email: settings.email } : {}),
              address: { "@type": "PostalAddress", addressLocality: "Москва", addressCountry: "RU" },
              brand: ["Technogym", "UNIX Fit"],
            }).replace(/</g, "\\u003c"),
          }}
        />
        {settings.yandexMetrikaId && <YandexMetrika id={settings.yandexMetrikaId} />}
      </body>
    </html>
  );
}
