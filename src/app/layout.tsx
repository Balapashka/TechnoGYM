import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CountryModal } from "@/components/layout/CountryModal";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { QuickViewDrawer } from "@/components/shop/QuickViewDrawer";
import { QuoteRequestModal } from "@/components/shop/QuoteRequestModal";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CompareBar } from "@/components/shop/CompareBar";
import { CompareToast } from "@/components/shop/CompareToast";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  // The storefront is Russian, so the Cyrillic subset must ship too — without
  // it every Russian glyph falls back to a system font.
  subsets: ["latin", "cyrillic"],
});

const title = "SPORT LINER — интернет-магазин тренажёров";
const description =
  "Демонстрационный интернет-магазин: кардио- и силовые тренажёры, свободные веса, аксессуары. Учебный проект — цены и характеристики приведены для примера.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  // Mirrors robots.txt: the demo stays out of search results until the catalog
  // holds real data (see SITE_INDEXABLE in src/lib/site.ts).
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <NavigationProgress />
        <MotionProvider>
          <Header />
          {children}
          <Footer />
          <CookieBanner />
          <CountryModal />
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
