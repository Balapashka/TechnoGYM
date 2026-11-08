import { describe, expect, it } from "vitest";
import { adminRemovalError, generateTempPassword } from "./team";

describe("generateTempPassword", () => {
  it("is readable and strong enough", () => {
    for (let i = 0; i < 50; i++) {
      const p = generateTempPassword();
      expect(p).toHaveLength(12);
      expect(p).toMatch(/^[A-HJ-NP-Za-km-z2-9]+$/); // no 0 O 1 l I
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
    }
  });

  it("differs every time", () => {
    expect(new Set(Array.from({ length: 20 }, () => generateTempPassword())).size).toBe(20);
  });
});

describe("adminRemovalError", () => {
  const base = { targetId: "b", currentUserId: "a", targetIsAdmin: true, adminCount: 2 };

  it("allows removing another admin while one stays", () => {
    expect(adminRemovalError(base)).toBeNull();
  });

  it("refuses yourself, the last admin and non-admins", () => {
    expect(adminRemovalError({ ...base, targetId: "a" })).toMatch(/самого себя/);
    expect(adminRemovalError({ ...base, adminCount: 1 })).toMatch(/хотя бы один/);
    expect(adminRemovalError({ ...base, targetIsAdmin: false })).toMatch(/не администратор/);
  });
});
