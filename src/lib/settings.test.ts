// lib/settings.test.ts
// Unit test resolver settings: env tetap jadi default, DB hanya override
// per field. Menutup kelas bug warm-cache (86d09b0) dengan melarang kolom Date
// masuk hasil yang dibungkus unstable_cache.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

vi.mock("@/lib/prisma", () => ({
  default: { siteSettings: { findUnique: vi.fn() } },
}));

import prisma from "@/lib/prisma";
import { settingsUpdateSchema } from "@/schema/settings";
import {
  DEFAULT_QUICK_LINK_KEYS,
  clearSettingsTranslationFields,
  envSiteSettings,
  getAdminSettings,
  getSiteSettings,
  mergeSettingsTranslations,
  rawIdOverrides,
  resolveSiteSettings,
  SITE_SETTINGS_ID,
  SITE_SETTINGS_SELECT,
  type SiteSettingsRow,
} from "./settings";

function idRow(overrides: Record<string, string>): SiteSettingsRow {
  return makeRow({ translations: { id: overrides } });
}

const env = envSiteSettings();

/** Baris DB dengan override admin pada sebagian field saja. */
function makeRow(overrides: Partial<SiteSettingsRow> = {}): SiteSettingsRow {
  return {
    fullName: null,
    jobTitle: null,
    bio: null,
    location: null,
    contactEmail: null,
    githubUrl: null,
    linkedinUrl: null,
    twitterUrl: null,
    instagramUrl: null,
    siteName: null,
    tagline: null,
    siteUrl: null,
    siteDescription: null,
    quickLinks: [...DEFAULT_QUICK_LINK_KEYS],
    translations: null,
    ...overrides,
  };
}

const findUnique = vi.mocked(prisma.siteSettings.findUnique);

describe("resolveSiteSettings", () => {
  it("returns the env defaults when there is no admin override yet", () => {
    expect(resolveSiteSettings(null)).toEqual(envSiteSettings());
  });

  it("prefers the row value per field and falls back to env per field", () => {
    const resolved = resolveSiteSettings(
      makeRow({ fullName: "Ridho A.", siteName: "ridho.dev", quickLinks: ["about", "contact"] }),
    );

    expect(resolved.fullName).toBe("Ridho A.");
    expect(resolved.siteName).toBe("ridho.dev");
    expect(resolved.quickLinks).toEqual(["about", "contact"]);

    expect(resolved.jobTitle).toBe(env.jobTitle);
    expect(resolved.bio).toBe(env.bio);
    expect(resolved.location).toBe(env.location);
    expect(resolved.contactEmail).toBe(env.contactEmail);
    expect(resolved.githubUrl).toBe(env.githubUrl);
    expect(resolved.linkedinUrl).toBe(env.linkedinUrl);
    expect(resolved.twitterUrl).toBe(env.twitterUrl);
    expect(resolved.instagramUrl).toBe(env.instagramUrl);
    expect(resolved.tagline).toBe(env.tagline);
    expect(resolved.siteUrl).toBe(env.siteUrl);
    expect(resolved.siteDescription).toBe(env.siteDescription);
  });

  it("treats a blank override as absent so the site is never blanked", () => {
    const resolved = resolveSiteSettings(
      makeRow({ fullName: "", jobTitle: "   ", siteDescription: "", instagramUrl: "" }),
    );

    expect(resolved.fullName).toBe(env.fullName);
    expect(resolved.jobTitle).toBe(env.jobTitle);
    expect(resolved.siteDescription).toBe(env.siteDescription);
    expect(resolved.instagramUrl).toBe(env.instagramUrl);
  });

  it("restores the default nav when the row overrides nothing", () => {
    expect(resolveSiteSettings(makeRow({ quickLinks: [] })).quickLinks).toEqual(
      DEFAULT_QUICK_LINK_KEYS,
    );
  });

  it("exposes no Date value, so a warm unstable_cache cannot change the type", () => {
    for (const resolved of [resolveSiteSettings(null), resolveSiteSettings(makeRow())]) {
      for (const value of Object.values(resolved)) {
        expect(value).not.toBeInstanceOf(Date);
      }
    }
  });

  it("never leaks createdAt/updatedAt into the cached payload", () => {
    expect(SITE_SETTINGS_SELECT).not.toHaveProperty("createdAt");
    expect(SITE_SETTINGS_SELECT).not.toHaveProperty("updatedAt");
    expect(resolveSiteSettings(null)).not.toHaveProperty("createdAt");
  });

  it("selects the translations column so locales can resolve", () => {
    expect(SITE_SETTINGS_SELECT).toHaveProperty("translations", true);
  });
});

describe("resolveSiteSettings with locale", () => {
  it("applies the id overrides over the base values", () => {
    const resolved = resolveSiteSettings(
      idRow({ bio: "Bio Indonesia.", jobTitle: "Pengembang Full Stack" }),
      "id",
    );

    expect(resolved.bio).toBe("Bio Indonesia.");
    expect(resolved.jobTitle).toBe("Pengembang Full Stack");
  });

  it("leaves proper nouns and identifiers on the base value", () => {
    const resolved = resolveSiteSettings(
      makeRow({
        fullName: "Ridho A.",
        translations: { id: { bio: "Bio Indonesia." } },
      }),
      "id",
    );

    expect(resolved.fullName).toBe("Ridho A.");
    expect(resolved.siteName).toBe(env.siteName);
    expect(resolved.contactEmail).toBe(env.contactEmail);
  });

  it("inherits the base value when the id override is missing", () => {
    const resolved = resolveSiteSettings(idRow({ bio: "Bio Indonesia." }), "id");

    expect(resolved.location).toBe(env.location);
    expect(resolved.tagline).toBe(env.tagline);
    expect(resolved.siteDescription).toBe(env.siteDescription);
  });

  it("inherits the base value when the id override is an empty string", () => {
    const resolved = resolveSiteSettings(
      idRow({ bio: "", location: "   " }),
      "id",
    );

    expect(resolved.bio).toBe(env.bio);
    expect(resolved.location).toBe(env.location);
  });

  it("ignores a corrupt translations payload instead of throwing", () => {
    const base = resolveSiteSettings(makeRow(), "id");
    for (const translations of ["rusak", ["id"], { id: "rusak" }, { fr: {} }]) {
      expect(resolveSiteSettings(makeRow({ translations }), "id")).toEqual(base);
    }
  });

  it("ignores the translations for the default locale", () => {
    const resolved = resolveSiteSettings(idRow({ bio: "Bio Indonesia." }), "en");

    expect(resolved.bio).toBe(env.bio);
  });
});

describe("rawIdOverrides", () => {
  it("returns the stored values including empty strings for form prefill", () => {
    expect(rawIdOverrides({ id: { bio: "", tagline: "Tagline ID." } }, "id")).toEqual({
      bio: "",
      tagline: "Tagline ID.",
    });
  });

  it("drops unknown fields and non-string values", () => {
    expect(
      rawIdOverrides({ id: { bio: "Bio ID.", fullName: "X", siteUrl: 42 } }, "id"),
    ).toEqual({ bio: "Bio ID." });
  });

  it("returns an empty object for missing or corrupt payloads", () => {
    expect(rawIdOverrides(null, "id")).toEqual({});
    expect(rawIdOverrides({ id: null }, "id")).toEqual({});
  });
});

describe("mergeSettingsTranslations", () => {
  it("merges the incoming group without touching unsent keys", () => {
    expect(
      mergeSettingsTranslations(
        { id: { bio: "Bio ID.", tagline: "Tagline ID." } },
        { id: { bio: "Bio ID baru." } },
      ),
    ).toEqual({ id: { bio: "Bio ID baru.", tagline: "Tagline ID." } });
  });

  it("keeps an empty string so the resolver inherits the base", () => {
    expect(
      mergeSettingsTranslations({ id: { bio: "Bio ID." } }, { id: { bio: "" } }),
    ).toEqual({ id: { bio: "" } });
  });

  it("returns null when nothing is stored and nothing arrives", () => {
    expect(mergeSettingsTranslations(null, undefined)).toBeNull();
    expect(mergeSettingsTranslations({ id: {} }, undefined)).toBeNull();
  });
});

describe("clearSettingsTranslationFields", () => {
  it("drops only the section fields and keeps the rest", () => {
    expect(
      clearSettingsTranslationFields(
        { id: { bio: "Bio ID.", tagline: "Tagline ID." } },
        ["bio", "jobTitle", "location"],
      ),
    ).toEqual({ id: { tagline: "Tagline ID." } });
  });

  it("returns null when no field survives", () => {
    expect(
      clearSettingsTranslationFields({ id: { bio: "Bio ID." } }, ["bio", "jobTitle", "location"]),
    ).toBeNull();
    expect(clearSettingsTranslationFields(null, ["bio", "jobTitle", "location"])).toBeNull();
  });
});

describe("envSiteSettings", () => {
  it("reads the author name and site name from the client env", () => {
    expect(env.fullName).toBe(process.env.NEXT_PUBLIC_AUTHOR_NAME ?? "Ridho Arachman");
    expect(env.siteName).toBe(process.env.NEXT_PUBLIC_SITE_NAME ?? "Ridho.dev");
  });

  it("defaults the nav to the six canonical keys", () => {
    expect(env.quickLinks).toEqual(DEFAULT_QUICK_LINK_KEYS);
  });
});

describe("DEFAULT_QUICK_LINK_KEYS", () => {
  it("holds the six canonical nav keys in order", () => {
    expect(DEFAULT_QUICK_LINK_KEYS).toEqual([
      "home",
      "about",
      "projects",
      "experience",
      "certificates",
      "contact",
    ]);
  });

  // src/schema/settings.ts menyalin key ini, bukan mengimpornya: file itu ikut
  // ter-bundle ke browser lewat form admin, sedangkan modul ini menarik Prisma
  // ke client graph. Test inilah penjaga sinkronisitas salinannya.
  it("matches the nav keys the admin API accepts", () => {
    const accepted = settingsUpdateSchema.shape.quickLinks.unwrap().element.options;

    expect([...accepted].sort()).toEqual([...DEFAULT_QUICK_LINK_KEYS].sort());
  });
});

describe("getSiteSettings", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("reads the singleton row and applies the DB overrides", async () => {
    findUnique.mockResolvedValue(
      makeRow({ fullName: "Ridho A." }) as Awaited<ReturnType<typeof findUnique>>,
    );

    await expect(getSiteSettings()).resolves.toMatchObject({ fullName: "Ridho A." });

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: SITE_SETTINGS_ID }, select: SITE_SETTINGS_SELECT }),
    );
  });

  it("falls back to the env defaults instead of throwing when the database is down", async () => {
    findUnique.mockRejectedValue(new Error("P1001: can't reach database server"));

    await expect(getSiteSettings()).resolves.toEqual(envSiteSettings());
  });

  it("resolves the requested locale from the stored translations", async () => {
    findUnique.mockResolvedValue(
      idRow({ bio: "Bio Indonesia." }) as Awaited<ReturnType<typeof findUnique>>,
    );

    await expect(getSiteSettings("id")).resolves.toMatchObject({ bio: "Bio Indonesia." });
    await expect(getSiteSettings()).resolves.toMatchObject({ bio: env.bio });
  });
});

describe("getAdminSettings", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns the resolved base plus the raw id overrides for the forms", async () => {
    findUnique.mockResolvedValue(
      makeRow({
        fullName: "Ridho A.",
        translations: { id: { bio: "Bio Indonesia.", tagline: "" } },
      }) as Awaited<ReturnType<typeof findUnique>>,
    );

    const payload = await getAdminSettings();

    expect(payload.fullName).toBe("Ridho A.");
    expect(payload.bio).toBe(env.bio);
    expect(payload.translations).toEqual({ id: { bio: "Bio Indonesia.", tagline: "" } });
  });

  it("returns null translations when nothing is stored", async () => {
    findUnique.mockResolvedValue(makeRow() as Awaited<ReturnType<typeof findUnique>>);

    await expect(getAdminSettings()).resolves.toMatchObject({ translations: null });
  });

  it("falls back to env with null translations when the database is down", async () => {
    findUnique.mockRejectedValue(new Error("P1001: can't reach database server"));

    await expect(getAdminSettings()).resolves.toEqual({ ...envSiteSettings(), translations: null });
  });
});
