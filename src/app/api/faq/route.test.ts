// route.test.ts
// Unit test POST /api/faq. Fokusnya wiring route, bukan matcher-nya: matcher
// sudah-covered sendiri di `lib/faq.test.ts`, jadi `lib/faq` dan
// `public-content` sengaja TIDAK di-mock agar kontrak body yang dibaca
// `porto-bot.tsx` benar-benar teruji dari query sampai JSON.
import { beforeEach, describe, expect, it, vi } from "vitest";

import enMessages from "@/messages/en.json";

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/settings", () => ({
  getSiteSettings: vi.fn(),
}));

vi.mock("@/lib/translations", () => ({
  getMessages: vi.fn(),
}));

vi.mock("@/utils/client-ip", () => ({
  getClientIp: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: { findMany: vi.fn() },
    experience: { findMany: vi.fn() },
    certificate: { findMany: vi.fn() },
    skill: { findMany: vi.fn() },
  },
}));

import prisma from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/settings";
import { getMessages } from "@/lib/translations";
import { getClientIp } from "@/utils/client-ip";
import { testSiteSettings } from "@/test-fixtures/public-content";
import { POST } from "./route";

// Slug yang dipakai matcher untuk memunculkan jawaban nyata, bukan cuma greeting.
const projects = [
  {
    slug: "porto-folio",
    title: "Portofolio Landing Page",
    description: "Landing page statis.",
    liveUrl: "https://porto.example.com",
    repoUrl: "https://github.com/ridho/porto",
    technologies: ["Next.js", "Tailwind"],
    role: "Frontend",
    year: "2024",
  },
];

const rateLimitHeaders = {
  "X-RateLimit-Limit": "30",
  "X-RateLimit-Remaining": "29",
  "X-RateLimit-Reset": "1700000000",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/faq", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Parameters<typeof POST>[0];
}

function makeRawRequest(rawBody: string) {
  return new Request("http://localhost:3000/api/faq", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rawBody,
  }) as Parameters<typeof POST>[0];
}

describe("POST /api/faq", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientIp).mockReturnValue("203.0.113.7");
    vi.mocked(applyRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 29,
      headers: rateLimitHeaders,
    });
    vi.mocked(getSiteSettings).mockResolvedValue(testSiteSettings);
    vi.mocked(getMessages).mockResolvedValue(enMessages);
    vi.mocked(prisma.project.findMany).mockResolvedValue(
      projects as Awaited<ReturnType<typeof prisma.project.findMany>>,
    );
    vi.mocked(prisma.experience.findMany).mockResolvedValue([]);
    vi.mocked(prisma.certificate.findMany).mockResolvedValue([]);
    vi.mocked(prisma.skill.findMany).mockResolvedValue([]);
  });

  it("balas 429 dan tidak menyentuh database kalau rate limit habis", async () => {
    vi.mocked(applyRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfter: 42,
      headers: { ...rateLimitHeaders, "X-Retry-After": "42" },
    });

    const res = await POST(makeRequest({ question: "porto-folio" }));

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({ error: "RATE_LIMITED" });
    expect(res.headers.get("X-Retry-After")).toBe("42");
    // Limiter jalan sebelum validasi dan sebelum query apa pun.
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it("balas 400 untuk body yang bukan JSON", async () => {
    const res = await POST(makeRawRequest("{ bukan json"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "INVALID_JSON" });
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it("balas 400 untuk pertanyaan kepanjangan atau locale asing", async () => {
    const res = await POST(makeRequest({ question: "x".repeat(281) }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "VALIDATION_ERROR" });

    const badLocale = await POST(makeRequest({ question: "hi", locale: "fr" }));
    expect(badLocale.status).toBe(400);
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it("balas 200 tanpa wrapper `data` — kontrak yang dibaca porto-bot.tsx", async () => {
    const res = await POST(makeRequest({ question: "porto-folio" }));

    expect(res.status).toBe(200);
    const payload = await res.json();
    // Kalau `{ data: ... }` snek masuk lagi, PortoBot render kosong tanpa error.
    expect(payload).not.toHaveProperty("data");
    expect(payload.answer).toMatch(/Portofolio Landing Page/);
  });

  it("memakai copy Indonesia saat locale id dan override-nya terisi", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue(
      [
        {
          ...projects[0],
          translations: {
            id: {
              title: "Halaman Arahan Portofolio",
              description: "Halaman arahan statis.",
            },
          },
        },
      ] as unknown as Awaited<ReturnType<typeof prisma.project.findMany>>,
    );

    const res = await POST(makeRequest({ question: "porto-folio", locale: "id" }));

    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.answer).toMatch(/Halaman Arahan Portofolio/);
    expect(payload.answer).not.toMatch(/Portofolio Landing Page/);
  });

  it("mewarisi base Inggris untuk field yang override Indonesianya kosong", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue(
      [
        {
          ...projects[0],
          translations: { id: { title: "   " } },
        },
      ] as unknown as Awaited<ReturnType<typeof prisma.project.findMany>>,
    );

    const res = await POST(makeRequest({ question: "porto-folio", locale: "id" }));

    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.answer).toMatch(/Portofolio Landing Page/);
  });

  it("balas sapaan dengan `intro` saat pertanyaan kosong", async () => {
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.intro).toMatch(/Ridho Arachman/);
    expect(payload.suggestions.length).toBeGreaterThan(0);
    expect(payload).not.toHaveProperty("answer");
  });

  it("hanya menarik konten publik: `isPublished` untuk yang punya, soft delete untuk semua", async () => {
    await POST(makeRequest({ question: "porto-folio" }));

    for (const model of [prisma.project, prisma.experience, prisma.certificate]) {
      expect(model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null, isPublished: true }),
        }),
      );
    }
    // Skill tidak punya `isPublished`, jadi filter itu akan jadi error Prisma.
    expect(prisma.skill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
    expect(vi.mocked(prisma.skill.findMany).mock.calls[0][0]).not.toHaveProperty(
      "where.isPublished",
    );
  });

  it("balas 500, bukan 200 dengan jawaban kosong, saat database gagal", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.project.findMany).mockRejectedValue(new Error("db down"));

    const res = await POST(makeRequest({ question: "porto-folio" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "INTERNAL_SERVER_ERROR" });
  });
});