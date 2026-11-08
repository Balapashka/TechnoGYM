import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./auth";

describe("changePasswordSchema", () => {
  const ok = { current: "TempPass234", password: "MyNewPassword1", confirm: "MyNewPassword1" };

  it("accepts a valid change", () => {
    expect(changePasswordSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects a short, mismatched or unchanged password", () => {
    expect(changePasswordSchema.safeParse({ ...ok, password: "short", confirm: "short" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, confirm: "Other1234" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, password: ok.current, confirm: ok.current }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, current: "" }).success).toBe(false);
  });
});
