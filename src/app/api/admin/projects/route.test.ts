// route.test.ts
// Unit test POST /api/admin/projects: memastikan ISR cache publik direvalidasi
// (revalidatePath) setelah create sukses, dan TIDAK direvalidasi saat gagal.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
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
  });

  it("does not revalidate when creation fails", async () => {
    vi.mocked(prisma.project.create).mockRejectedValue(
      new Error("P1001: database offline"),
    );

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
  });

  it("does not revalidate on validation error", async () => {
    const res = await POST(makeRequest({ ...validBody, title: "no" }));

    expect(res.status).toBe(400);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
  });
});
