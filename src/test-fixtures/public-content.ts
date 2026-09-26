// Fixture bersama untuk test yang merender komponen publik di luar layout.
// Nilai settings di sini sengajaoze dummy: yang penting bentuknya `SiteSettings`
// yang valid, karena `PublicContentProvider` menerimanya apa adanya.
import enMessages from "@/messages/en.json";
import { composePublicContent } from "@/lib/public-content";
import type { SiteSettings } from "@/lib/settings";
import type { Messages } from "@/lib/translation-types";

export const testSiteSettings: SiteSettings = {
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

/** Dokumen hasil overlay, sama dengan yang dihidupi layout publik. */
export const testMessages: Messages = composePublicContent(
  enMessages,
  testSiteSettings,
);
