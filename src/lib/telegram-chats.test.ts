import { describe, expect, it } from "vitest";
import {
  LINK_CODE_RE,
  findLinkedChat,
  isTokenRejected,
  looksLikeBotToken,
  staleOffset,
  mergeChats,
  newLinkCode,
  normalizeApiBase,
} from "./telegram-chats";

describe("mergeChats", () => {
  it("keeps saved chats and adds new ones", () => {
    expect(
      mergeChats([{ id: "1", title: "A" }], [{ id: "2", title: "B" }, { id: "1", title: "A2" }]),
    ).toEqual([
      { id: "1", title: "A2" },
      { id: "2", title: "B" },
    ]);
  });
});

describe("looksLikeBotToken", () => {
  it("accepts the BotFather format only", () => {
    expect(looksLikeBotToken("1234567890:AAH9g1pQJ6l9xY3v5mK8nB2cD4eF6gH8iJ0")).toBe(true);
    expect(looksLikeBotToken("hello")).toBe(false);
    expect(looksLikeBotToken("1234:short")).toBe(false);
  });
});

describe("normalizeApiBase", () => {
  it("keeps a plain https address without the trailing slash", () => {
    expect(normalizeApiBase(" https://notify.sportliner.store/ ")).toBe("https://notify.sportliner.store");
    expect(normalizeApiBase("https://relay.example/tg")).toBe("https://relay.example/tg");
  });
  it("rejects anything that is not a plain https URL", () => {
    expect(normalizeApiBase("")).toBe("");
    expect(normalizeApiBase("http://relay.example")).toBe("");
    expect(normalizeApiBase("relay.example")).toBe("");
    expect(normalizeApiBase("https://user:pass@relay.example")).toBe("");
    expect(normalizeApiBase("https://relay.example/?x=1")).toBe("");
  });
});

describe("isTokenRejected", () => {
  it("tells a refused token from a network failure", () => {
    expect(isTokenRejected("Unauthorized")).toBe(true);
    expect(isTokenRejected("Not Found")).toBe(true);
    expect(isTokenRejected("The operation was aborted due to timeout")).toBe(false);
    expect(isTokenRejected("Telegram HTTP 403")).toBe(false);
  });
});

describe("link codes", () => {
  it("generates random codes the server accepts", () => {
    const a = newLinkCode();
    expect(a).toMatch(LINK_CODE_RE);
    expect(newLinkCode()).not.toBe(a);
  });

  const code = "0123456789abcdef01234567";
  const updates = [
    { update_id: 5, message: { text: "/start", chat: { id: 1, first_name: "Чужой" } } },
    { update_id: 6, message: { text: "/start wrongcode000000000", chat: { id: 2, first_name: "Тоже" } } },
    { update_id: 7, message: { text: `/start ${code}`, chat: { id: 42, first_name: "Ерлан" } } },
    { update_id: 8, message: { text: `/start@SportlinerStore_Bot ${code}`, chat: { id: -100, title: "Менеджеры" } } },
  ];

  it("links only the chat that sent this code", () => {
    expect(findLinkedChat(updates, code)).toEqual({ id: "42", title: "Ерлан" });
    expect(findLinkedChat(updates.slice(3), code)).toEqual({ id: "-100", title: "Менеджеры" });
    expect(findLinkedChat(updates.slice(0, 2), code)).toBeNull();
  });

  it("confirms only stale updates, so a fresh code survives for other pollers", () => {
    const now = 1_000_000;
    const batch = [
      { update_id: 10, message: { text: "/start", date: now - 3600 } },
      { update_id: 11, message: { text: "/start x", date: now - 1000 } },
      { update_id: 12, message: { text: `/start ${code}`, date: now - 30 } },
    ];
    expect(staleOffset(batch, now)).toBe(12);
    expect(staleOffset(batch.slice(2), now)).toBeNull();
    expect(staleOffset([], now)).toBeNull();
  });
});
