import { describe, expect, it } from "vitest";
import {
  addLocaleToPath,
  DEFAULT_LOCALE,
  getAlternatePaths,
  getLocaleFromPath,
  isValidLocale,
  LOCALES,
  removeLocaleFromPath,
} from "./i18n";

describe("isValidLocale", () => {
  it("accepts a supported locale", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("id")).toBe(true);
  });

  it("rejects an unsupported locale", () => {
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale("")).toBe(false);
  });
});

describe("getLocaleFromPath", () => {
  it("reads the locale from the first segment", () => {
    expect(getLocaleFromPath("/en")).toBe("en");
    expect(getLocaleFromPath("/id/about")).toBe("id");
  });

  it("returns null when the path has no locale segment", () => {
    expect(getLocaleFromPath("/")).toBeNull();
    expect(getLocaleFromPath("/about")).toBeNull();
    expect(getLocaleFromPath("/admin/login")).toBeNull();
  });
});

describe("removeLocaleFromPath", () => {
  it("strips a leading locale segment", () => {
    expect(removeLocaleFromPath("/en/about")).toBe("/about");
    expect(removeLocaleFromPath("/id/projects/slug")).toBe("/projects/slug");
  });

  it("returns the root path when only a locale is present", () => {
    expect(removeLocaleFromPath("/en")).toBe("/");
  });

  it("leaves paths without a locale untouched", () => {
    expect(removeLocaleFromPath("/admin/projects")).toBe("/admin/projects");
  });
});

describe("addLocaleToPath", () => {
  it("prefixes a path with the given locale", () => {
    expect(addLocaleToPath("/about", "id")).toBe("/id/about");
  });

  it("replaces an existing locale instead of stacking them", () => {
    expect(addLocaleToPath("/en/about", "id")).toBe("/id/about");
  });

  it("returns the locale root without a trailing slash", () => {
    expect(addLocaleToPath("/", "en")).toBe("/en");
  });
});

describe("getAlternatePaths", () => {
  it("produces one path per supported locale", () => {
    expect(getAlternatePaths("/about")).toEqual({
      en: "/en/about",
      id: "/id/about",
    });
  });

  it("derives alternates from a path that already has a locale", () => {
    expect(getAlternatePaths("/en/about")).toEqual({
      en: "/en/about",
      id: "/id/about",
    });
  });

  it("maps the root path to each locale root", () => {
    expect(getAlternatePaths("/")).toEqual({ en: "/en", id: "/id" });
  });
});

describe("locale configuration", () => {
  it("supports exactly English and Indonesian", () => {
    expect(LOCALES).toEqual(["en", "id"]);
  });

  it("defaults to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});
