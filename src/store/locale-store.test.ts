import { beforeEach, describe, expect, it } from "vitest";
import {
  useLocaleStore,
  COUNTRIES,
  DEFAULT_COUNTRY,
} from "./locale-store";

const reset = () =>
  useLocaleStore.setState({
    country: DEFAULT_COUNTRY,
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

  it("switches country and updates locale + currency together", () => {
    useLocaleStore.getState().setCountry("GB");
    const c = useLocaleStore.getState().country;
    expect(c.code).toBe("GB");
    expect(c.locale).toBe("en-GB");
    expect(c.currency).toBe("GBP");
  });

  it("ignores an unknown country code", () => {
    useLocaleStore.getState().setCountry("ZZ");
    expect(useLocaleStore.getState().country.code).toBe(DEFAULT_COUNTRY.code);
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

  it("exposes a EUR country and a non-EUR country", () => {
    expect(COUNTRIES.some((c) => c.currency === "EUR")).toBe(true);
    expect(COUNTRIES.some((c) => c.currency !== "EUR")).toBe(true);
  });
});
