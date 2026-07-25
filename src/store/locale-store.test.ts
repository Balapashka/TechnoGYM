import { beforeEach, describe, expect, it } from "vitest";
import {
  useLocaleStore,
  COUNTRIES,
  DEFAULT_COUNTRY,
} from "./locale-store";
import { DEFAULT_LOCALE } from "@/i18n/translations";

const reset = () =>
  useLocaleStore.setState({
    country: DEFAULT_COUNTRY,
    language: DEFAULT_LOCALE,
    cookieAccepted: null,
    countryModalDismissed: false,
  });

describe("locale-store", () => {
  beforeEach(reset);

  it("starts with the default country and undecided cookie state", () => {
    const s = useLocaleStore.getState();
    expect(s.country.code).toBe(DEFAULT_COUNTRY.code);
    expect(s.cookieAccepted).toBeNull();
    expect(s.countryModalDismissed).toBe(false);
  });

  it("defaults to Russia and the Russian language", () => {
    expect(DEFAULT_COUNTRY.code).toBe("RU");
    expect(useLocaleStore.getState().language).toBe("ru");
  });

  it("switches country and updates locale + currency together", () => {
    useLocaleStore.getState().setCountry("KZ");
    const c = useLocaleStore.getState().country;
    expect(c.code).toBe("KZ");
    expect(c.locale).toBe("ru-KZ");
    expect(c.currency).toBe("KZT");
  });

  it("ignores an unknown country code", () => {
    useLocaleStore.getState().setCountry("ZZ");
    expect(useLocaleStore.getState().country.code).toBe(DEFAULT_COUNTRY.code);
  });

  it("switches the UI language to English and back", () => {
    useLocaleStore.getState().setLanguage("en");
    expect(useLocaleStore.getState().language).toBe("en");
    useLocaleStore.getState().setLanguage("ru");
    expect(useLocaleStore.getState().language).toBe("ru");
  });

  it("records cookie acceptance and decline", () => {
    useLocaleStore.getState().acceptCookies();
    expect(useLocaleStore.getState().cookieAccepted).toBe(true);
    useLocaleStore.getState().declineCookies();
    expect(useLocaleStore.getState().cookieAccepted).toBe(false);
  });

  it("dismisses the country modal", () => {
    useLocaleStore.getState().dismissCountryModal();
    expect(useLocaleStore.getState().countryModalDismissed).toBe(true);
  });

  it("offers only CIS countries", () => {
    expect(COUNTRIES.map((c) => c.code).sort()).toEqual([
      "KG",
      "KZ",
      "RU",
      "UZ",
    ]);
    expect(COUNTRIES.every((c) => c.locale.startsWith("ru-"))).toBe(true);
  });
});
