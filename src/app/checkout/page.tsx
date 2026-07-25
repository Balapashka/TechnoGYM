import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Оформление заказа — SPORT LINER" };

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CheckoutForm />
    </main>
  );
}
