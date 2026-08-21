// [id]/route.test.ts
// Unit test PUT & DELETE /api/admin/projects/[id]: memastikan ISR cache publik
// direvalidasi (revalidatePath) setelah update/delete sukses — termasuk path
// slug lama saat slug berganti — dan TIDAK direvalidasi pada jalur gagal.
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
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { DELETE, PUT } from "./route";

function routeCtx(id = "p1"): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

function putRequest(body: object) {
  return new Request("http://localhost:3000/api/admin/projects/p1", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Parameters<typeof PUT>[0];
}

describe("PUT /api/admin/projects/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue({
      user: { id: "admin-1" },
    } as Awaited<ReturnType<typeof requireAdminSession>>);
  });

  it("revalidates /projects and the final slug path on success", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: "p1",
      slug: "stable-slug",
    } as Awaited<ReturnType<typeof prisma.project.findUnique>>);
    vi.mocked(prisma.project.update).mockResolvedValue({
      id: "p1",
      slug: "stable-slug",
    } as Awaited<ReturnType<typeof prisma.project.update>>);

    const res = await PUT(putRequest({ title: "Updated Title" }), routeCtx());

    expect(res.status).toBe(200);
    const calls = vi.mocked(revalidatePath).mock.calls;
    expect(calls).toContainEqual(["/projects"]);
    expect(calls).toContainEqual(["/projects/stable-slug"]);
  });

  it("also invalidates the previous slug path when the slug changes", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: "p1",
      slug: "old-slug",
    } as Awaited<ReturnType<typeof prisma.project.findUnique>>);
    vi.mocked(prisma.project.update).mockResolvedValue({
      id: "p1",
      slug: "new-slug",
    } as Awaited<ReturnType<typeof prisma.project.update>>);

    const res = await PUT(
      putRequest({ slug: "new-slug", title: "Renamed Project" }),
      routeCtx(),
    );

    expect(res.status).toBe(200);
    const calls = vi.mocked(revalidatePath).mock.calls;
    expect(calls).toContainEqual(["/projects"]);
    expect(calls).toContainEqual(["/projects/new-slug"]);
    expect(calls).toContainEqual(["/projects/old-slug"]);
  });

  it("does not revalidate when the project is missing (404)", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(
      null as Awaited<ReturnType<typeof prisma.project.findUnique>>,
    );

    const res = await PUT(putRequest({ title: "Ghost Update" }), routeCtx());

    expect(res.status).toBe(404);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
  });
});

describe("DELETE /api/admin/projects/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue({
      user: { id: "admin-1" },
    } as Awaited<ReturnType<typeof requireAdminSession>>);
  });

  it("revalidates /projects and the deleted slug path on success", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: "p1",
      slug: "gone-slug",
    } as Awaited<ReturnType<typeof prisma.project.findUnique>>);
    vi.mocked(prisma.project.delete).mockResolvedValue({
      id: "p1",
      slug: "gone-slug",
    } as Awaited<ReturnType<typeof prisma.project.delete>>);

    const res = await DELETE(
      new Request("http://localhost:3000/api/admin/projects/p1", {
        method: "DELETE",
      }) as Parameters<typeof DELETE>[0],
      routeCtx(),
    );

    expect(res.status).toBe(200);
    const calls = vi.mocked(revalidatePath).mock.calls;
    expect(calls).toContainEqual(["/projects"]);
    expect(calls).toContainEqual(["/projects/gone-slug"]);
  });

  it("does not revalidate when the project is missing (404)", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(
      null as Awaited<ReturnType<typeof prisma.project.findUnique>>,
    );

    const res = await DELETE(
      new Request("http://localhost:3000/api/admin/projects/p1", {
        method: "DELETE",
      }) as Parameters<typeof DELETE>[0],
      routeCtx(),
    );

    expect(res.status).toBe(404);
    expect(vi.mocked(revalidatePath).mock.calls.length).toBe(0);
  });
});
