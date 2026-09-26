// Unit test overlay: lima field yang dipindah dari copy hardcode ke admin.
import { describe, expect, it } from "vitest";

import enMessages from "@/messages/en.json";
import { composePublicContent } from "./public-content";
import { type SiteSettings } from "./settings";

const settings: SiteSettings = {
  fullName: "Ridho Arachman",
  jobTitle: "Full Stack Developer",
  bio: "Bio dari admin.",
  location: "Jakarta, Indonesia",
  contactEmail: "ridho@example.com",
  githubUrl: "https://github.com/ridho",
  linkedinUrl: "https://linkedin.com/in/ridho",
  twitterUrl: "https://twitter.com/ridho",
  siteName: "Ridho.dev",
  tagline: "Tagline dari admin.",
  siteUrl: "https://example.com",
  siteDescription: "Deskripsi dari admin.",
  quickLinks: ["home", "about"],
};

describe("composePublicContent", () => {
  it("memakai templat {name} di hero.greeting", () => {
    const out = composePublicContent(enMessages, settings);
    expect(out.hero.greeting).toBe("Hi, I'm Ridho Arachman");
  });

  it("mengambil nama dari settings, bukan string yang tertanam di JSON", () => {
    const out = composePublicContent(enMessages, { ...settings, fullName: "Budi Santoso" });
    expect(out.hero.greeting).toBe("Hi, I'm Budi Santoso");
    expect(out.hero.greeting).not.toContain("{name}");
  });

  it("menimpa lima field dari settings", () => {
    const out = composePublicContent(enMessages, settings);
    expect(out.hero.title).toBe(settings.jobTitle);
    expect(out.hero.description).toBe(settings.bio);
    expect(out.footer.tagline).toBe(settings.tagline);
    expect(out.contact.location).toBe(settings.location);
  });

  it("tidak menyentuh hero.typewriter maupun key i18n lain", () => {
    const out = composePublicContent(enMessages, settings);
    expect(out.hero.typewriter).toEqual(enMessages.hero.typewriter);
    expect(out.nav).toEqual(enMessages.nav);
    expect(out.seo).toEqual(enMessages.seo);
  });

  it("tidak memutasi dokumen asli", () => {
    const before = enMessages.hero.title;
    composePublicContent(enMessages, settings);
    expect(enMessages.hero.title).toBe(before);
  });

  it("mempertahankan jumlah leaf yang sama setelah overlay", () => {
    const leaves = (value: unknown): number => {
      if (typeof value === "string") return 1;
      if (Array.isArray(value)) return value.length;
      if (value && typeof value === "object") {
        return Object.values(value).reduce<number>((sum, v) => sum + leaves(v), 0);
      }
      return 0;
    };
    expect(leaves(composePublicContent(enMessages, settings))).toBe(leaves(enMessages));
  });
});
