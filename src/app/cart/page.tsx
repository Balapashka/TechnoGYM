import { CartView } from "./CartView";

export const metadata = { title: "Корзина — SPORT LINER" };

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CartView />
    </main>
  );
}
