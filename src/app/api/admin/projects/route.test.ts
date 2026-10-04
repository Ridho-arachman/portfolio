// route.test.ts
// Unit test POST /api/admin/projects: memastikan ISR cache publik direvalidasi
// (revalidatePath) setelah create sukses, dan TIDAK direvalidasi saat gagal.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    category: { findMany: vi.fn() },
    certificate: { findMany: vi.fn() },
    experience: { findMany: vi.fn() },
    rateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// POST auto-fills blank Indonesian overrides, which reaches MyMemory unless the
// translator is stubbed. Keep this suite off the network.
vi.mock("@/lib/translate", () => ({
  translateTexts: vi.fn(async (texts: string[]) => texts.map(() => "")),
}));

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { POST } from "./route";

const validBody = {
  title: "Audit Fix Project",
  description: "A project created to verify revalidation after create.",
  thumbnail: "https://example.com/thumb.png",
  technologies: ["Next.js"],
  gallery: [],
  highlights: [],
  isPublished: true,
  order: 1,
  categoryId: "cat-1",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/admin/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Parameters<typeof POST>[0];
}

describe("POST /api/admin/projects", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue({
      user: { id: "admin-1" },
    } as Awaited<ReturnType<typeof requireAdminSession>>);
    vi.mocked(applyRateLimit).mockResolvedValue({
      allowed: true,
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "9",
        "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 60),
      },
    } as Awaited<ReturnType<typeof applyRateLimit>>);
    // Default: semua id yang dikirim ada, supaya test lain tidak gagal karena
    // efek samping validasi id.
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1" },
    ] as Awaited<ReturnType<typeof prisma.category.findMany>>);
    vi.mocked(prisma.certificate.findMany).mockResolvedValue(
      [] as Awaited<ReturnType<typeof prisma.certificate.findMany>>,
    );
    vi.mocked(prisma.experience.findMany).mockResolvedValue(
      [] as Awaited<ReturnType<typeof prisma.experience.findMany>>,
    );
  });

  it("revalidates /projects and the new detail path on success", async () => {
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: "p1",
      slug: "audit-fix-project",
    } as Awaited<ReturnType<typeof prisma.project.create>>);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(201);
    const calls = vi.mocked(revalidatePath).mock.calls;
    expect(calls).toContainEqual(["/projects"]);
    expect(calls).toContainEqual(["/projects/audit-fix-project"]);
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("projects", { expire: 0 });
  });

  it("does not revalidate when creation fails", async () => {
    vi.mocked(prisma.project.create).mockRejectedValue(
      new Error("P1001: database offline"),
    );

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
    expect(vi.mocked(revalidateTag).mock.calls.length).toBe(0);
  });

  it("does not revalidate on validation error", async () => {
    const res = await POST(makeRequest({ ...validBody, title: "no" }));

    expect(res.status).toBe(400);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
    expect(vi.mocked(revalidateTag).mock.calls.length).toBe(0);
  });

  it("rejects a missing categoryId because the column is NOT NULL", async () => {
    const res = await POST(
      makeRequest({ ...validBody, categoryId: undefined }),
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Category is required");
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("rejects an empty categoryId before touching the database", async () => {
    const res = await POST(makeRequest({ ...validBody, categoryId: "" }));

    expect(res.status).toBe(400);
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  // Relasi m-n memakai tabel join implisit: `connect` dengan id yang tidak ada
  // akan menyimpan baris join yang menunjuk entitas fiktif, bukan melempar
  // error. Karena itu id harus dicek di trust boundary.
  it("answers 400 naming an unknown certificate id instead of writing a broken link", async () => {
    vi.mocked(prisma.certificate.findMany).mockResolvedValue(
      [] as Awaited<ReturnType<typeof prisma.certificate.findMany>>,
    );

    const res = await POST(
      makeRequest({ ...validBody, certificateIds: ["does-not-exist"] }),
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(
      "Unknown certificate ids: does-not-exist",
    );
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("connects the supplied relation ids on create", async () => {
    vi.mocked(prisma.certificate.findMany).mockResolvedValue([
      { id: "c1" },
    ] as Awaited<ReturnType<typeof prisma.certificate.findMany>>);
    vi.mocked(prisma.experience.findMany).mockResolvedValue([
      { id: "e1" },
    ] as Awaited<ReturnType<typeof prisma.experience.findMany>>);
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: "p1",
      slug: "audit-fix-project",
    } as Awaited<ReturnType<typeof prisma.project.create>>);

    const res = await POST(
      makeRequest({
        ...validBody,
        certificateIds: ["c1"],
        experienceIds: ["e1"],
      }),
    );

    expect(res.status).toBe(201);
    const written = vi.mocked(prisma.project.create).mock.calls[0]?.[0]?.data;
    expect(written).toMatchObject({
      categoryId: "cat-1",
      certificates: { connect: [{ id: "c1" }] },
      experiences: { connect: [{ id: "e1" }] },
    });
  });
});
