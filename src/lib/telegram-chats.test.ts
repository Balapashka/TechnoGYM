import { describe, expect, it } from "vitest";
import { extractChats, looksLikeBotToken, mergeChats } from "./telegram-chats";

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
