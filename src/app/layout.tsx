import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CountryModal } from "@/components/layout/CountryModal";
import { QuickViewDrawer } from "@/components/shop/QuickViewDrawer";
import { CartDrawer } from "@/components/shop/CartDrawer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPORT LINER — Demo Fitness Store",
  description:
    "Educational e-commerce demo. Generic content, placeholder media, mock products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Header />
        {children}
        <Footer />
        <CookieBanner />
        <CountryModal />
        <QuickViewDrawer />
        <CartDrawer />
      </body>
    </html>
  );
}
