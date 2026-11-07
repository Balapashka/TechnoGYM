import { describe, expect, it } from "vitest";
import { extractChats, isTokenRejected, looksLikeBotToken, mergeChats, normalizeApiBase } from "./telegram-chats";

describe("extractChats", () => {
  it("collects unique private and group chats", () => {
    const chats = extractChats([
      { message: { chat: { id: 42, type: "private", first_name: "Ерлан", last_name: "Б." } } },
      { message: { chat: { id: 42, type: "private", first_name: "Ерлан" } } },
      { my_chat_member: { chat: { id: -100123, type: "supergroup", title: "Заказы" } } },
      {},
    ]);
    expect(chats).toEqual([
      { id: "42", title: "Ерлан" },
      { id: "-100123", title: "Заказы" },
    ]);
  });
});

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
