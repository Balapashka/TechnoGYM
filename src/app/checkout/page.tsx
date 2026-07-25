import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout — SPORT LINER" };

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CheckoutForm />
    </main>
  );
}
