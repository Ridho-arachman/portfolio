import { describe, expect, it, vi } from "vitest";

import { testSiteSettings } from "@/test-fixtures/public-content";
import { getSiteSettings } from "@/lib/settings";

vi.mock("@/lib/settings", () => ({
  getSiteSettings: vi.fn(),
}));

// `next/font/google` hanya jalan lewat loader Next; di luar build ia tidak
// mengembalikan class font, jadi stub agar modul layout bisa diimpor.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans", className: "" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono", className: "" }),
}));

import { generateMetadata } from "./layout";

const settings = {
  ...testSiteSettings,
  siteUrl: "https://domain-baru.test",
  siteName: "Studio Baru",
  siteDescription: "Deskripsi dari database.",
  fullName: "Nama Baru",
  jobTitle: "Jabatan Baru",
  bio: "Bio dari database.",
  twitterUrl: "https://twitter.com/handle-baru",
};

describe("generateMetadata (root layout)", () => {
  it("mengambil title, description, dan URL dari site settings", async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(settings);

    const metadata = await generateMetadata();

    expect(String(metadata.metadataBase)).toBe("https://domain-baru.test/");
    expect(metadata.title).toEqual({
      default: "Nama Baru | Jabatan Baru",
      template: "%s | Nama Baru",
    });
    expect(metadata.description).toBe("Deskripsi dari database.");
    expect(metadata.openGraph?.url).toBe("https://domain-baru.test");
    expect(metadata.openGraph?.siteName).toBe("Studio Baru");
    expect(metadata.openGraph?.title).toBe("Nama Baru | Jabatan Baru");
    expect(metadata.authors).toEqual([
      { name: "Nama Baru", url: "https://domain-baru.test" },
    ]);
  });

  it("tidak lagi memakai string hardcode domain lama", async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(settings);

    const metadata = await generateMetadata();

    // Nilai lama yang tertanam di `export const metadata` sebelum refactor.
    expect(JSON.stringify(metadata)).not.toContain("ridhoarachman.dev");
    expect(metadata.creator).toBe("Nama Baru");
    expect(metadata.publisher).toBe("Nama Baru");
  });

  it("mempertahankan blok robots, keywords, twitter, dan verification", async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(settings);

    const metadata = await generateMetadata();

    expect(metadata.robots).toBe("index, follow");
    expect(metadata.keywords).toContain("Full Stack Developer");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Nama Baru | Jabatan Baru",
      images: ["/og-image.png"],
    });
    expect(metadata.verification).toEqual({
      google: "google-site-verification-code",
    });
  });

  it("menurunkan handle twitter dari twitterUrl settings", async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(settings);

    const metadata = await generateMetadata();

    expect(metadata.twitter).toMatchObject({ creator: "@handle-baru" });
  });
});
