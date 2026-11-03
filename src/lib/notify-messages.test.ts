import { describe, expect, it } from "vitest";
import {
  customerOrderMessage,
  customerStatusMessage,
  managerLeadMessage,
  managerOrderMessage,
  type OrderForMessage,
} from "./notify-messages";

const order: OrderForMessage = {
  id: "cmabcdefgh12345678",
  email: "buyer@example.com",
  customerName: "Иван Петров",
  phone: "+79991234567",
  deliveryMethod: "delivery",
  country: "RU",
  city: "Москва",
  address: "ул. Ленина, 1",
  postalCode: "101000",
  comment: "Позвонить после 18",
  paymentMethod: "manual",
  totalCents: 4580000,
  currency: "RUB",
  items: [
    { nameSnapshot: "Дорожка R-300", variantName: "Pro", quantity: 2, priceCents: 2290000 },
  ],
};

const n = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

describe("managerOrderMessage", () => {
  const text = n(managerOrderMessage(order, "https://shop.ru/admin/orders/x"));

  it("leads with the order number and total", () => {
    expect(text.split("\n")[0]).toMatch(/^🛒 Новый заказ №12345678 — 45 800 ₽$/);
  });

  it("lists items with variant, contacts, address, comment and admin link", () => {
    expect(text).toContain("• Дорожка R-300 (Pro) × 2 — 45 800 ₽");
    expect(text).toContain("Телефон: +79991234567");
    expect(text).toContain("Доставка: 101000, RU, Москва, ул. Ленина, 1");
    expect(text).toContain("Комментарий: Позвонить после 18");
    expect(text).toContain("https://shop.ru/admin/orders/x");
  });

  it("describes pickup without an address", () => {
    const t = managerOrderMessage({ ...order, deliveryMethod: "pickup" }, "u");
    expect(t).toContain("Самовывоз");
    expect(t).not.toContain("Ленина");
  });
});

describe("customerOrderMessage", () => {
  it("addresses the customer and includes the store phone", () => {
    const m = customerOrderMessage(order, "SPORT LINER", "+7 495 000-00-00");
    expect(m.subject).toBe("Заказ №12345678 принят — SPORT LINER");
    expect(m.text).toContain("Здравствуйте, Иван Петров!");
    expect(m.text).toContain("Вопросы по заказу: +7 495 000-00-00");
  });

  it("omits the phone line when the store has none", () => {
    expect(customerOrderMessage(order, "S", "").text).not.toContain("Вопросы по заказу");
  });
});

describe("customerStatusMessage", () => {
  it("names the new status", () => {
    const m = customerStatusMessage(order.id, "SHIPPED", "SPORT LINER");
    expect(m.subject).toBe("Заказ №12345678: отправлен — SPORT LINER");
    expect(m.text).toContain("«Отправлен»");
  });
});

describe("managerLeadMessage", () => {
  it("labels the lead by its source and skips empty fields", () => {
    const t = managerLeadMessage(
      { source: "business", productName: "Для бизнеса: Клуб", name: "Анна", phone: "+7900", email: null, comment: null },
      "https://shop.ru/admin/quote-requests",
    );
    expect(t.split("\n")[0]).toBe("📩 Для бизнеса: Для бизнеса: Клуб");
    expect(t).not.toContain("Email:");
    expect(t).not.toContain("Комментарий:");
  });
});
