import { beforeEach, describe, expect, it, vi } from "vitest";

import { testSiteSettings } from "@/test-fixtures/public-content";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import robots from "./robots";
import sitemap from "./sitemap";

vi.mock("@/lib/settings", () => ({
  getSiteSettings: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: { findMany: vi.fn() },
    experience: { findMany: vi.fn() },
    certificate: { findMany: vi.fn() },
  },
}));

const SITE_URL = "https://domain-baru.test";

beforeEach(() => {
  vi.mocked(getSiteSettings).mockResolvedValue({
    ...testSiteSettings,
    siteUrl: SITE_URL,
  });
  vi.mocked(prisma.project.findMany).mockResolvedValue([]);
  vi.mocked(prisma.experience.findMany).mockResolvedValue([]);
  vi.mocked(prisma.certificate.findMany).mockResolvedValue([]);
});

describe("robots", () => {
  it("membentuk sitemap URL dari site settings, bukan env", async () => {
    await expect(robots()).resolves.toMatchObject({
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it("tetap menutup /api dan /admin", async () => {
    const result = await robots();

    expect(result.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    ]);
  });
});

describe("sitemap", () => {
  it("membangun URL statis dari base URL settings", async () => {
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      `${SITE_URL}`,
      `${SITE_URL}/about`,
      `${SITE_URL}/projects`,
      `${SITE_URL}/experience`,
      `${SITE_URL}/certificates`,
      `${SITE_URL}/contact`,
    ]);
  });

  it("membangun URL entri detail dari base URL settings", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { slug: "alpha", updatedAt: new Date("2026-01-01") },
    ] as Awaited<ReturnType<typeof prisma.project.findMany>>);
    vi.mocked(prisma.experience.findMany).mockResolvedValue([
      { slug: "beta", updatedAt: new Date("2026-01-02") },
    ] as Awaited<ReturnType<typeof prisma.experience.findMany>>);
    vi.mocked(prisma.certificate.findMany).mockResolvedValue([
      { slug: "gamma", updatedAt: new Date("2026-01-03") },
    ] as Awaited<ReturnType<typeof prisma.certificate.findMany>>);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/projects/alpha`);
    expect(urls).toContain(`${SITE_URL}/experience/beta`);
    expect(urls).toContain(`${SITE_URL}/certificates/gamma`);
  });

  // Regresi: filter isPublished yang bocor draftrecent commit adalah hal yang
  // paling mudah hilang saat URL refactor, jadi dikunci di sini.
  it("tetap menyaring entri unpublished di ketiga model", async () => {
    await sitemap();

    for (const findMany of [
      prisma.project.findMany,
      prisma.experience.findMany,
      prisma.certificate.findMany,
    ]) {
      expect(vi.mocked(findMany).mock.calls[0]?.[0]).toMatchObject({
        where: { isPublished: true },
      });
    }
  });

  it("tetap mengembalikan rute statis saat database mati", async () => {
    vi.mocked(prisma.project.findMany).mockRejectedValue(
      new Error("P1001: Can't reach database server"),
    );

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/about`);
    expect(urls).not.toContain(`${SITE_URL}/projects/alpha`);
  });
});
