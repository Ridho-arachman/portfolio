import { describe, expect, it, vi } from "vitest";
import { translateTexts, type TranslateFetch } from "./translate";

function fakeFetch(
  json: unknown,
  ok = true,
): TranslateFetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(json), { status: ok ? 200 : 500 }),
  );
}

function okPayload(translatedText: string, responseStatus = 200) {
  return { responseData: { translatedText }, responseStatus };
}

describe("translateTexts", () => {
  it("translates each element via MyMemory en|id", async () => {
    const fetchImpl = fakeFetch(okPayload("Halo Dunia"));
    const out = await translateTexts(["Hello World"], "id", fetchImpl);

    expect(out).toEqual(["Halo Dunia"]);
    const url = vi.mocked(fetchImpl).mock.calls[0][0] as string;
    expect(url).toContain("api.mymemory.translated.net");
    expect(url).toContain(`q=${encodeURIComponent("Hello World")}`);
    expect(url).toContain(`langpair=${encodeURIComponent("en|id")}`);
  });

  it("translates multiple elements in order", async () => {
    const fetchImpl: TranslateFetch = vi.fn(async (input) => {
      const q = new URL(String(input)).searchParams.get("q") ?? "";
      return new Response(
        JSON.stringify(okPayload(`ID:${q}`)),
        { status: 200 },
      );
    });

    const out = await translateTexts(["One", "Two"], "id", fetchImpl);

    expect(out).toEqual(["ID:One", "ID:Two"]);
    expect(vi.mocked(fetchImpl)).toHaveBeenCalledTimes(2);
  });

  it("returns blank without calling fetch for blank input", async () => {
    const fetchImpl = fakeFetch(okPayload("X"));

    const out = await translateTexts(["   "], "id", fetchImpl);

    expect(out).toEqual([""]);
    expect(vi.mocked(fetchImpl)).not.toHaveBeenCalled();
  });

  it("degrades to blank on network failure", async () => {
    const fetchImpl: TranslateFetch = vi.fn(async () => {
      throw new Error("offline");
    });

    await expect(translateTexts(["Hello"], "id", fetchImpl)).resolves.toEqual([
      "",
    ]);
  });

  it("degrades to blank on non-OK HTTP status", async () => {
    await expect(
      translateTexts(["Hello"], "id", fakeFetch({}, false)),
    ).resolves.toEqual([""]);
  });

  it("degrades to blank when MyMemory reports an error status", async () => {
    const quota = {
      responseData: {
        translatedText:
          "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS",
      },
      responseStatus: 429,
    };

    await expect(
      translateTexts(["Hello"], "id", fakeFetch(quota)),
    ).resolves.toEqual([""]);
  });

  it("degrades to blank on empty translated text", async () => {
    await expect(
      translateTexts(["Hello"], "id", fakeFetch(okPayload("  "))),
    ).resolves.toEqual([""]);
  });
});
