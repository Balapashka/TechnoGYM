import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { yookassaEnabled } from "@/lib/payments/yookassa";

export const metadata: Metadata = {
  title: "Оформление заказа — SPORT LINER",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  return (
    <main className="flex flex-1 flex-col">
      <CheckoutForm
        onlinePayment={yookassaEnabled()}
        pickupAddress={settings.pickupAddress.trim()}
        deliveryNote={settings.deliveryNote.trim()}
        defaultEmail={user?.email}
        defaultName={user?.name ?? undefined}
      />
    </main>
  );
}
