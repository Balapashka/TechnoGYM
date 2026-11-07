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
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";
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

const title = "SPORT LINER — интернет-магазин тренажёров";
const description =
  "Интернет-магазин тренажёров: беговые дорожки, велотренажёры, силовые станции, свободные веса и аксессуары для дома и фитнес-клубов. Доставка по России и СНГ.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  // Mirrors robots.txt: the site stays out of search results until
  // SITE_INDEXABLE=true (see src/lib/site.ts).
  robots: SITE_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "SPORT LINER",
    locale: "ru_RU",
    title,
    description,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title, description },
};

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
      </body>
    </html>
  );
}
