// translations.test.ts
// Unit test untuk lapisan override terjemahan: getMessages (DB patch -> bundled
// fallback) dan resolveMessages (expand dotted key -> validasi terhadap shape
// hasil turunan en.json -> deep merge).
import { beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache diteruskan apa adanya supaya test menguji fungsi kita sendiri,
// bukan wrapper cache (pola yang sama dengan route test di repo ini).
vi.mock("next/cache", () => ({
  unstable_cache: <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
  ) => fn,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    translation: {
      findUnique: vi.fn(),
    },
  },
}));

import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import prisma from "@/lib/prisma";
import type { Messages } from "./translation-types";
import { getMessages, resolveMessages, translationPatchSchema } from "./translations";

const findUnique = vi.mocked(prisma.translation.findUnique);

type TranslationRow = Awaited<ReturnType<typeof prisma.translation.findUnique>>;

const row = (values: unknown): TranslationRow => ({ values } as TranslationRow);

/** Kumpulkan seluruh leaf (string) beserta path-nya, untuk mendeteksi key yang hilang. */
function collectLeaves(
  node: unknown,
  prefix = "",
): Array<[path: string, value: unknown]> {
  if (node === null || typeof node !== "object" || Array.isArray(node)) {
    return [[prefix, node]];
  }
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    collectLeaves(value, prefix ? `${prefix}.${key}` : key),
  );
}

beforeEach(() => {
  findUnique.mockReset();
  findUnique.mockResolvedValue(null);
});

describe("resolveMessages — identity fast path", () => {
  it("returns the bundled document untouched for a null patch", () => {
    expect(resolveMessages(enMessages, null)).toBe(enMessages);
  });

  it("returns the bundled document untouched for an empty patch", () => {
    expect(resolveMessages(enMessages, {})).toBe(enMessages);
  });
});

describe("resolveMessages — targeted override", () => {
  it("overrides only the targeted key and leaves its siblings alone", () => {
    const merged = resolveMessages(enMessages, { "hero.greeting": "Halo, saya Ridho" });

    expect(merged.hero.greeting).toBe("Halo, saya Ridho");
    expect(merged.hero.title).toBe(enMessages.hero.title);
    expect(merged.hero.description).toBe(enMessages.hero.description);
    // Sibling namespace ikut utuh.
    expect(merged.nav).toEqual(enMessages.nav);
  });

  it("does not mutate the bundled document it was given", () => {
    const before = enMessages.hero.greeting;
    resolveMessages(enMessages, { "hero.greeting": "Halo" });

    expect(enMessages.hero.greeting).toBe(before);
  });

  it("merges a three-level-deep patch without dropping its sibling branches", () => {
    const merged = resolveMessages(idMessages, {
      "skills.categories.DEVOPS_TOOLS": "Alat DevOps",
    });

    expect(merged.skills.categories.DEVOPS_TOOLS).toBe("Alat DevOps");
    // Cabang lain pada level yang sama harus tetap ada.
    expect(merged.skills.categories.FRONTEND).toBe(idMessages.skills.categories.FRONTEND);
    expect(merged.skills.categories.BACKEND).toBe(idMessages.skills.categories.BACKEND);
  });
});

describe("resolveMessages — unknown key rejection", () => {
  it("rejects an unknown leaf inside a known namespace", () => {
    expect(() => resolveMessages(enMessages, { "hero.nonexistent": "x" })).toThrow();
  });

  it("rejects an unknown top-level namespace", () => {
    expect(() => resolveMessages(enMessages, { nonexistentNamespace: "x" })).toThrow();
  });

  it("rejects a key that only exists in a different branch of the tree", () => {
    expect(() => resolveMessages(enMessages, { "hero.greeting.deep": "x" })).toThrow();
  });
});

describe("resolveMessages — malformed dotted key rejection", () => {
  it.each([
    ["leading dot", ".hero"],
    ["trailing dot", "hero."],
    ["empty segment", "hero..greeting"],
    ["empty key", ""],
  ])("rejects a malformed dotted key (%s: %j)", (_label, key) => {
    expect(() => resolveMessages(enMessages, { [key]: "x" })).toThrow();
  });
});

describe("translationPatchSchema — admin API body", () => {
  it("accepts a normal dotted key with a non-empty value", () => {
    const parsed = translationPatchSchema.safeParse({ values: { "hero.greeting": "Halo" } });

    expect(parsed.success).toBe(true);
  });

  it("accepts a key whose segment contains an underscore", () => {
    // skills.categories.DEVOPS_TOOLS benar-benar ada di en.json, jadi harus bisa
    // diedit lewat admin juga.
    const parsed = translationPatchSchema.safeParse({
      values: { "skills.categories.DEVOPS_TOOLS": "Alat DevOps" },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects an empty translation value", () => {
    const parsed = translationPatchSchema.safeParse({ values: { "hero.greeting": "" } });

    expect(parsed.success).toBe(false);
  });

  it.each([
    ["leading dot", ".hero"],
    ["trailing dot", "hero."],
    ["empty segment", "hero..greeting"],
    ["space inside a segment", "hero greeting"],
  ])("rejects a malformed dotted key (%s: %j)", (_label, key) => {
    const parsed = translationPatchSchema.safeParse({ values: { [key]: "x" } });

    expect(parsed.success).toBe(false);
  });
});

describe("getMessages — DB patch over bundled", () => {
  it("returns the bundled document when the locale has no DB row", async () => {
    findUnique.mockResolvedValue(null);

    await expect(getMessages("en")).resolves.toEqual(enMessages);
  });

  it("queries the translation row for the requested locale only", async () => {
    await getMessages("id");

    expect(findUnique).toHaveBeenCalledWith({
      where: { locale: "id" },
      select: { values: true },
    });
  });

  it("merges a stored patch on top of the bundled document", async () => {
    findUnique.mockResolvedValue(row({ "hero.greeting": "Halo, saya Ridho" }));

    const messages = await getMessages("id");

    expect(messages.hero.greeting).toBe("Halo, saya Ridho");
    expect(messages.hero.title).toBe(idMessages.hero.title);
  });
});

describe("getMessages — never throws, never blanks the site", () => {
  it("falls back to the bundled document when prisma rejects", async () => {
    findUnique.mockRejectedValue(new Error("DB is down"));

    await expect(getMessages("en")).resolves.toEqual(enMessages);
    await expect(getMessages("id")).resolves.toEqual(idMessages);
  });

  it("falls back to the bundled document when the stored values are not a patch", async () => {
    findUnique.mockResolvedValue(row("not-a-record"));

    await expect(getMessages("en")).resolves.toEqual(enMessages);
  });

  it("falls back to the bundled document when the stored patch holds a non-string value", async () => {
    findUnique.mockResolvedValue(row({ "hero.greeting": 42 }));

    await expect(getMessages("en")).resolves.toEqual(enMessages);
  });

  it("falls back to the bundled document when the stored patch holds an unknown key", async () => {
    findUnique.mockResolvedValue(row({ "hero.nonexistent": "x" }));

    await expect(getMessages("en")).resolves.toEqual(enMessages);
  });
});

describe("resolveMessages — prototype pollution guard", () => {
  it("rejects a __proto__ dotted key without touching Object.prototype", () => {
    expect(() =>
      resolveMessages(enMessages, { "__proto__.polluted": "yes" } as Record<string, string>),
    ).toThrow();
    expect(Object.prototype).not.toHaveProperty("polluted");
  });

  it("rejects a constructor.prototype dotted key without touching Object.prototype", () => {
    expect(() =>
      resolveMessages(enMessages, {
        "constructor.prototype.polluted": "yes",
      } as Record<string, string>),
    ).toThrow();
    expect(Object.prototype).not.toHaveProperty("polluted");
  });
});

describe("merged document stays a complete Messages", () => {
  const merged = resolveMessages(enMessages, {
    "hero.greeting": "Halo",
    "skills.categories.DEVOPS_TOOLS": "Alat DevOps",
  });

  it("is assignable to Messages", () => {
    const asMessages: Messages = merged;

    expect(asMessages).toBe(merged);
  });

  it("keeps exactly the same leaf paths as the bundled document", () => {
    const bundledPaths = collectLeaves(enMessages).map(([path]) => path).sort();
    const mergedPaths = collectLeaves(merged).map(([path]) => path).sort();

    // Kalau merge-nya dangkal (object namespace tergantikan utuh), daftar leaf
    // ini akan menyusut — inilah kelas bug yang test ini intends to catch.
    expect(mergedPaths).toEqual(bundledPaths);
  });

  it("leaves no leaf undefined after a partial merge", () => {
    for (const [path, value] of collectLeaves(merged)) {
      expect(value, `leaf ${path} must not be undefined`).not.toBeUndefined();
      // en.json punya satu leaf berbentuk string[] (hero.typewriter); sisanya string.
      const isStringOrStringArray =
        typeof value === "string" ||
        (Array.isArray(value) && value.every((item) => typeof item === "string"));
      expect(isStringOrStringArray, `leaf ${path} must be a string or string[]`).toBe(true);
    }
  });
});
