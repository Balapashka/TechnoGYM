import { describe, expect, it } from "vitest";
import { smtpErrorHint, smtpPresetFor } from "./smtp-presets";

describe("smtpPresetFor", () => {
  it("knows the common Russian services", () => {
    expect(smtpPresetFor("Shop@Yandex.ru")?.host).toBe("smtp.yandex.ru");
    expect(smtpPresetFor("a@ya.ru")?.host).toBe("smtp.yandex.ru");
    expect(smtpPresetFor("a@bk.ru")?.host).toBe("smtp.mail.ru");
    expect(smtpPresetFor("a@gmail.com")?.port).toBe(465);
  });

  it("returns null for a custom domain or garbage", () => {
    expect(smtpPresetFor("info@sportliner.store")).toBeNull();
    expect(smtpPresetFor("not-an-email")).toBeNull();
  });
});

describe("smtpErrorHint", () => {
  it("explains a rejected password", () => {
    expect(smtpErrorHint("Invalid login: 535 5.7.8 Error: authentication failed")).toMatch(/пароль приложения/);
  });
  it("explains a connection failure", () => {
    expect(smtpErrorHint("connect ETIMEDOUT 1.2.3.4:465")).toMatch(/соединиться/);
  });
});
