import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CountryModal } from "@/components/layout/CountryModal";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { QuickViewDrawer } from "@/components/shop/QuickViewDrawer";
import { CartDrawer } from "@/components/shop/CartDrawer";

const inter = Inter({
  variable: "--font-sans",
  // The storefront is Russian, so the Cyrillic subset must ship too — without
  // it every Russian glyph falls back to a system font.
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "SPORT LINER — интернет-магазин тренажёров",
  description:
    "Демонстрационный интернет-магазин: кардио- и силовые тренажёры, свободные веса, аксессуары. Учебный проект — цены и характеристики приведены для примера.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <MotionProvider>
          <Header />
          {children}
          <Footer />
          <CookieBanner />
          <CountryModal />
          <QuickViewDrawer />
          <CartDrawer />
        </MotionProvider>
      </body>
    </html>
  );
}
