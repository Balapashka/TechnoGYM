import { CartView } from "./CartView";

export const metadata = { title: "Cart — Movigym" };

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CartView />
    </main>
  );
}
