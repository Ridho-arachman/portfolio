// Unit test DELETE /api/admin/categories/[id]/purge.
//
// Fokus: `Project.categoryId` = `onDelete: Restrict`, jadi purge kategori yang
// masih dipakai project melempar P2003. Route harus mengubahnya jadi 409 yang
// menyuruh admin reassign/remove project — bukan 500 buram, dan tidak boleh
// membocorkan detail Prisma.
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

vi.mock("@/lib/security-log", () => ({
  logSecurityEvent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    category: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { applyRateLimit } from "@/lib/rate-limit";
import { DELETE } from "./route";

const PURGE = "http://localhost:3000/api/admin/categories/cat-1/purge?confirm=true";

function purgeRequest(url = PURGE) {
  return new Request(url, { method: "DELETE" }) as Parameters<typeof DELETE>[0];
}

function purgeCtx(id = "cat-1") {
  return { params: Promise.resolve({ id }) };
}

/** P2003 seperti yang dilempar Prisma untuk pelanggaran foreign key. */
function restrictViolation() {
  return Object.assign(new Error("Foreign key constraint violated"), {
    code: "P2003",
    meta: { field_name: "project_categoryId_fkey (index)" },
  });
}

describe("DELETE /api/admin/categories/[id]/purge", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue({
      user: { id: "admin-1" },
    } as Awaited<ReturnType<typeof requireAdminSession>>);
    vi.mocked(applyRateLimit).mockResolvedValue({
      allowed: true,
      headers: {},
    } as Awaited<ReturnType<typeof applyRateLimit>>);
    vi.mocked(prisma.category.delete).mockReset();
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: "cat-1",
      slug: "web-dev",
    } as Awaited<ReturnType<typeof prisma.category.findUnique>>);
  });

  it("answers 409 with an actionable message when projects still use the category", async () => {
    vi.mocked(prisma.category.delete).mockRejectedValue(restrictViolation());

    const res = await DELETE(purgeRequest(), purgeCtx());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toMatch(/reassign|remove/i);
    expect(json.error).toMatch(/projects/i);
    // Detail Prisma internal tidak boleh bocor ke client.
    expect(json.error).not.toContain("P2003");
    expect(json.error).not.toContain("fkey");
    expect(json.error).not.toContain("index");
  });

  it("still returns 200 and purges when nothing references the category", async () => {
    vi.mocked(prisma.category.delete).mockResolvedValue({
      id: "cat-1",
      slug: "web-dev",
    } as Awaited<ReturnType<typeof prisma.category.delete>>);

    const res = await DELETE(purgeRequest(), purgeCtx());

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe(
      "Category permanently deleted",
    );
  });

  it("does not swallow an unrelated failure into the 409 message", async () => {
    vi.mocked(prisma.category.delete).mockRejectedValue(
      new Error("P1001: database offline"),
    );

    const res = await DELETE(purgeRequest(), purgeCtx());

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Category operation failed");
  });
});