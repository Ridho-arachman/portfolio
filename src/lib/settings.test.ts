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
  envSiteSettings,
  getSiteSettings,
  resolveSiteSettings,
  SITE_SETTINGS_ID,
  SITE_SETTINGS_SELECT,
  type SiteSettingsRow,
} from "./settings";

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
    siteName: null,
    tagline: null,
    siteUrl: null,
    siteDescription: null,
    quickLinks: [...DEFAULT_QUICK_LINK_KEYS],
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
    expect(resolved.tagline).toBe(env.tagline);
    expect(resolved.siteUrl).toBe(env.siteUrl);
    expect(resolved.siteDescription).toBe(env.siteDescription);
  });

  it("treats a blank override as absent so the site is never blanked", () => {
    const resolved = resolveSiteSettings(
      makeRow({ fullName: "", jobTitle: "   ", siteDescription: "" }),
    );

    expect(resolved.fullName).toBe(env.fullName);
    expect(resolved.jobTitle).toBe(env.jobTitle);
    expect(resolved.siteDescription).toBe(env.siteDescription);
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
});
