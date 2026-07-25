import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout — Movigym" };

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CheckoutForm />
    </main>
  );
}
