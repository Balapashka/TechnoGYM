import { describe, expect, it } from "vitest";
import { quoteRequestSchema, normalizePhone } from "./quote";

const validRequest = {
  productId: "p1",
  productName: "Technogym Skillrun TG-1200",
  name: "Иван",
  phone: "+7 (999) 123-45-67",
  email: "buyer@example.com",
  comment: "Когда будет доставка?",
};

/** Shorthand: parse the valid request with one field overridden. */
function parseWith(overrides: Partial<Record<string, unknown>>) {
  return quoteRequestSchema.safeParse({ ...validRequest, ...overrides });
}

describe("normalizePhone", () => {
  it("strips spaces, brackets and hyphens", () => {
    expect(normalizePhone("+7 (999) 123-45-67")).toBe("+79991234567");
    expect(normalizePhone(" 8 999 123 45 67 ")).toBe("89991234567");
  });
});

describe("quoteRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(parseWith({}).success).toBe(true);
  });

  describe("phone", () => {
    it("normalizes the value in the output", () => {
      const res = parseWith({});
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.phone).toBe("+79991234567");
    });

    it("accepts a number without a country code", () => {
      expect(parseWith({ phone: "999 123-45-67" }).success).toBe(true);
    });

    it("rejects fewer than 10 digits", () => {
      expect(parseWith({ phone: "123-45-67" }).success).toBe(false);
      expect(parseWith({ phone: "" }).success).toBe(false);
    });

    it("rejects letters and other junk", () => {
      expect(parseWith({ phone: "позвоните мне" }).success).toBe(false);
      expect(parseWith({ phone: "+7 999 123 45 67 доб. 12" }).success).toBe(
        false,
      );
    });
  });

  describe("name", () => {
    it("requires at least 2 characters", () => {
      expect(parseWith({ name: "И" }).success).toBe(false);
      expect(parseWith({ name: " " }).success).toBe(false);
    });
  });

  describe("productName", () => {
    it("is required", () => {
      expect(parseWith({ productName: "" }).success).toBe(false);
    });
  });

  describe("productId", () => {
    it("is optional", () => {
      expect(parseWith({ productId: undefined }).success).toBe(true);
      expect(parseWith({ productId: "" }).success).toBe(true);
    });
  });

  describe("email", () => {
    it("is optional", () => {
      const omitted = parseWith({ email: undefined });
      expect(omitted.success).toBe(true);
      if (omitted.success) expect(omitted.data.email).toBeUndefined();

      const empty = parseWith({ email: "  " });
      expect(empty.success).toBe(true);
      if (empty.success) expect(empty.data.email).toBeUndefined();
    });

    it("rejects a malformed value when provided", () => {
      expect(parseWith({ email: "nope" }).success).toBe(false);
      expect(parseWith({ email: "a@b" }).success).toBe(false);
    });
  });

  describe("comment", () => {
    it("is optional and capped at 1000 characters", () => {
      expect(parseWith({ comment: undefined }).success).toBe(true);
      expect(parseWith({ comment: "x".repeat(1000) }).success).toBe(true);
      expect(parseWith({ comment: "x".repeat(1001) }).success).toBe(false);
    });

    it("parses an empty comment to undefined", () => {
      const res = parseWith({ comment: "   " });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.comment).toBeUndefined();
    });
  });

  it("rejects a non-object payload", () => {
    expect(quoteRequestSchema.safeParse(null).success).toBe(false);
    expect(quoteRequestSchema.safeParse("nope").success).toBe(false);
  });
});
