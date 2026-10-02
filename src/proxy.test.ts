import { describe, expect, it } from "vitest";

import { getInvalidLocaleRedirect, resolveRedirectLocale } from "@/lib/i18n";

describe("resolveRedirectLocale", () => {
  it("memakai cookie NEXT_LOCALE yang valid di atas Accept-Language", () => {
    expect(
      resolveRedirectLocale({ cookieLocale: "id", acceptLanguage: "en-US,en;q=0.9" }),
    ).toBe("id");
  });

  it("mengabaikan cookie yang invalid lalu memakai Accept-Language", () => {
    expect(resolveRedirectLocale({ cookieLocale: "fr", acceptLanguage: "id-ID,id;q=0.9" })).toBe(
      "id",
    );
  });

  it("jatuh ke DEFAULT_LOCALE bila cookie dan header tidak valid", () => {
    expect(resolveRedirectLocale({ cookieLocale: null, acceptLanguage: "fr-FR,fr;q=0.9" })).toBe(
      "en",
    );
    expect(resolveRedirectLocale()).toBe("en");
  });
});

describe("getInvalidLocaleRedirect", () => {
  it("menstrip segmen locale-ish invalid dan memakai cookie", () => {
    expect(getInvalidLocaleRedirect("/fr/about", { cookieLocale: "id" })).toBe("/id/about");
  });

  it("/fr/about tanpa cookie memakai Accept-Language lalu default", () => {
    expect(getInvalidLocaleRedirect("/fr/about", { acceptLanguage: "id-ID,id;q=0.9" })).toBe(
      "/id/about",
    );
    expect(getInvalidLocaleRedirect("/fr/about")).toBe("/en/about");
  });

  it("segmen invalid tanpa sisa path menjadi locale root", () => {
    expect(getInvalidLocaleRedirect("/fr")).toBe("/en");
  });

  it("tidak menyentuh path locale valid maupun non-locale", () => {
    expect(getInvalidLocaleRedirect("/en/fr/about")).toBeNull();
    expect(getInvalidLocaleRedirect("/en/about")).toBeNull();
    expect(getInvalidLocaleRedirect("/about")).toBeNull();
    expect(getInvalidLocaleRedirect("/admin/login")).toBeNull();
    expect(getInvalidLocaleRedirect("/")).toBeNull();
  });
});
