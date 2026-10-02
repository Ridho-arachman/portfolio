import { describe, expect, it, vi } from "vitest";
import {
  fillMissingIdOverrides,
  translatableBase,
  withAutoIdTranslations,
} from "./content-i18n";
import { translateTexts } from "./translate";

type TranslateFn = typeof translateTexts;

function stubTranslate(map: Record<string, string>): TranslateFn {
  return vi.fn(async (texts: string[]) =>
    texts.map((t) => map[t] ?? ""),
  ) as TranslateFn;
}

describe("translatableBase", () => {
  it("picks only listed string/array fields", () => {
    expect(
      translatableBase(
        { title: "T", count: 3, tags: ["a"], other: "x" },
        ["title", "tags", "missing"],
      ),
    ).toEqual({ title: "T", tags: ["a"] });
  });
});

describe("fillMissingIdOverrides", () => {
  it("fills blank fields from the English base", async () => {
    const out = await fillMissingIdOverrides(
      { title: "Hello", description: "World" },
      undefined,
      ["title", "description"],
      stubTranslate({ Hello: "Halo", World: "Dunia" }),
    );

    expect(out).toEqual({ title: "Halo", description: "Dunia" });
  });

  it("never overwrites a manual override", async () => {
    const translate = stubTranslate({ Hello: "AUTO" });

    const out = await fillMissingIdOverrides(
      { title: "Hello" },
      { title: "Judul Manual" },
      ["title"],
      translate,
    );

    expect(out).toEqual({ title: "Judul Manual" });
    expect(translate).not.toHaveBeenCalled();
  });

  it("leaves the field absent when the base has no value", async () => {
    const translate = stubTranslate({});

    const out = await fillMissingIdOverrides(
      {},
      undefined,
      ["title"],
      translate,
    );

    expect(out).toEqual({});
    expect(translate).not.toHaveBeenCalled();
  });

  it("translates arrays element-wise and drops failed elements", async () => {
    const out = await fillMissingIdOverrides(
      { highlights: ["Shipped", "Led team"] },
      undefined,
      ["highlights"],
      stubTranslate({ Shipped: "Merilis" }),
    );

    expect(out).toEqual({ highlights: ["Merilis"] });
  });

  it("leaves an array field absent when every element fails", async () => {
    const out = await fillMissingIdOverrides(
      { highlights: ["Shipped"] },
      undefined,
      ["highlights"],
      stubTranslate({}),
    );

    expect(out).toEqual({});
  });

  it("keeps a manual array override untouched", async () => {
    const translate = stubTranslate({ Shipped: "AUTO" });

    const out = await fillMissingIdOverrides(
      { highlights: ["Shipped"] },
      { highlights: ["Manual"] },
      ["highlights"],
      translate,
    );

    expect(out).toEqual({ highlights: ["Manual"] });
    expect(translate).not.toHaveBeenCalled();
  });

  it("degrades to absent when the translator fails", async () => {
    const failing = vi.fn(async () => [""]) as TranslateFn;

    const out = await fillMissingIdOverrides(
      { title: "Hello" },
      undefined,
      ["title"],
      failing,
    );

    expect(out).toEqual({});
  });
});

describe("withAutoIdTranslations", () => {
  it("merges filled id overrides and preserves other locales", async () => {
    const out = await withAutoIdTranslations(
      { title: "Hello" },
      { en: { title: "Hello" }, id: { title: "" } } as {
        en: { title: string };
        id: { title: string };
      },
      ["title"],
      stubTranslate({ Hello: "Halo" }),
    );

    expect(out?.id?.["title"]).toBeDefined();
    expect((out as { en: { title: string } }).en).toEqual({
      title: "Hello",
    });
  });

  it("returns undefined untouched when there is nothing to store", async () => {
    const failing = vi.fn(async () => [""]) as TranslateFn;

    const out = await withAutoIdTranslations(
      { title: "Hello" },
      undefined,
      ["title"],
      failing,
    );

    expect(out).toBeUndefined();
  });

  it("returns the container untouched when nothing was filled", async () => {
    const failing = vi.fn(async () => [""]) as TranslateFn;
    const translations = { id: { title: "" } };

    const out = await withAutoIdTranslations(
      { title: "Hello" },
      translations,
      ["title"],
      failing,
    );

    expect(out).toBe(translations);
  });
});
