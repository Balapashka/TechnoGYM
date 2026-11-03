import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  missingLaunchSettings,
  phoneHref,
  socialHref,
  socialLinksFrom,
} from "./settings-shape";
import { settingsSchema } from "@/schemas/settings";
import { orderNumber } from "./order-format";

describe("mergeSettings", () => {
  it("overlays stored values on defaults and ignores unknown keys", () => {
    const s = mergeSettings([
      { key: "phone", value: "+7 495 000" },
      { key: "hacker", value: "x" },
    ]);
    expect(s.phone).toBe("+7 495 000");
    expect(s.workingHours).toBe(DEFAULT_SETTINGS.workingHours);
    expect("hacker" in s).toBe(false);
  });
});

describe("missingLaunchSettings", () => {
  it("lists the empty legally required fields", () => {
    expect(missingLaunchSettings(DEFAULT_SETTINGS)).toEqual([
      "phone",
      "email",
      "legalName",
      "inn",
      "ogrn",
      "legalAddress",
    ]);
  });
});

describe("links", () => {
  it("builds tel: links", () => {
    expect(phoneHref("+7 (495) 123-45-67")).toBe("tel:+74951234567");
  });

  it("turns handles into URLs and keeps full URLs", () => {
    expect(socialHref("telegram", "@shop")).toBe("https://t.me/shop");
    expect(socialHref("whatsapp", "+7 999 000-00-00")).toBe("https://wa.me/79990000000");
    expect(socialHref("vk", "https://vk.com/shop")).toBe("https://vk.com/shop");
    expect(socialHref("youtube", "")).toBeNull();
  });

  it("returns only filled social links", () => {
    const links = socialLinksFrom({ ...DEFAULT_SETTINGS, telegram: "@a" });
    expect(links.map((l) => l.key)).toEqual(["telegram"]);
  });
});

describe("settingsSchema", () => {
  it("accepts empty optional values", () => {
    expect(settingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
  });

  it("validates INN, OGRN and email formats", () => {
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, inn: "123" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, inn: "7712345678" }).success).toBe(true);
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ogrn: "1" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, email: "nope" }).success).toBe(false);
  });
});

describe("orderNumber", () => {
  it("is the upper-cased tail of the id", () => {
    expect(orderNumber("cmabcdefgh12345xyz")).toBe("H12345XYZ".slice(-8));
  });
});
