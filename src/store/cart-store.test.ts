import { beforeEach, describe, expect, it } from "vitest";
import {
  useCartStore,
  cartCount,
  cartTotalCents,
  lineKey,
  MAX_LINE_QUANTITY,
  type CartItem,
} from "./cart-store";

const base: Omit<CartItem, "quantity"> = {
  productId: "p1",
  slug: "runner-x1",
  name: "Runner X1",
  image: "/placeholders/product-1000x1000.png",
  variantId: null,
  variantName: null,
  unitPriceCents: 385000,
  currency: "EUR",
};

const reset = () => useCartStore.setState({ items: [] });

describe("cart-store", () => {
  beforeEach(reset);

  it("adds a new item with default quantity 1", () => {
    useCartStore.getState().addItem(base);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("merges the same product+variant by increasing quantity", () => {
    useCartStore.getState().addItem(base, 2);
    useCartStore.getState().addItem(base, 3);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });

  it("keeps different variants as separate lines", () => {
    useCartStore.getState().addItem(base);
    useCartStore
      .getState()
      .addItem({ ...base, variantId: "v2", variantName: "With tablet holder" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("updates quantity and removes the line when set to zero", () => {
    useCartStore.getState().addItem(base, 4);
    useCartStore.getState().setQuantity("p1", null, 2);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    useCartStore.getState().setQuantity("p1", null, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes an item by product+variant", () => {
    useCartStore.getState().addItem(base);
    useCartStore.getState().removeItem("p1", null);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("clears the cart", () => {
    useCartStore.getState().addItem(base, 3);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("computes count and total across lines", () => {
    const items: CartItem[] = [
      { ...base, quantity: 2 },
      {
        ...base,
        variantId: "v2",
        variantName: "With tablet holder",
        unitPriceCents: 397000,
        quantity: 1,
      },
    ];
    expect(cartCount(items)).toBe(3);
    expect(cartTotalCents(items)).toBe(385000 * 2 + 397000);
  });

  it("caps a line at MAX_LINE_QUANTITY when adding", () => {
    useCartStore.getState().addItem(base, MAX_LINE_QUANTITY);
    useCartStore.getState().addItem(base, 10);
    expect(useCartStore.getState().items[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("caps a line at MAX_LINE_QUANTITY when setting the quantity", () => {
    useCartStore.getState().addItem(base);
    useCartStore.getState().setQuantity("p1", null, 5000);
    expect(useCartStore.getState().items[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("builds a stable line key", () => {
    expect(lineKey("p1", null)).toBe("p1::_");
    expect(lineKey("p1", "v2")).toBe("p1::v2");
  });
});
