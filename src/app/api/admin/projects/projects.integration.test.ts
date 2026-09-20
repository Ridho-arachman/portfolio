// Integration tests for /api/admin/projects (+ [id]) against a real Postgres.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { POST as createRoute } from "./route";

const unique = Date.now();
const prefix = `it-proj-${unique}`;
const mockedRequire = vi.mocked(requireAdminSession);

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title: `${prefix} Platform`,
    description: "A long enough description for the integration test.",
    thumbnail: "https://images.example.com/cover.jpg",
    technologies: ["Next.js", "Prisma"],
    gallery: [],
    highlights: ["Fast", "Typed"],
    isPublished: true,
    order: 1,
    ...overrides,
  };
}

function post(body: unknown) {
  return createRoute(
    new Request("http://localhost/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue(
    {} as unknown as Awaited<ReturnType<typeof requireAdminSession>>,
  );
});

describe("POST /api/admin/projects", () => {
  it("creates a project, generates a slug, and revalidates paths", async () => {
    const res = await post(validBody());

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.slug).toBe(`${prefix}-platform`);

    const row = await prisma.project.findUnique({
      where: { slug: `${prefix}-platform` },
    });
    expect(row?.isPublished).toBe(true);

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/projects");
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(`/projects/${json.data.slug}`);
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("projects", { expire: 0 });
  });

  it("maps a duplicate slug (P2002) to a 409 conflict", async () => {
    const res = await post(validBody({ slug: `${prefix}-platform` }));

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("already exists");
    expect(json.error).not.toContain("prisma");
  });

  it("rejects an invalid thumbnail URL with 400", async () => {
    const res = await post(validBody({ thumbnail: "not-a-url" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when updating an unknown project", async () => {
    const { PUT: updateRoute } = await import("./[id]/route");
    const res = await updateRoute(
      new Request("http://localhost/api/admin/projects/does-not-exist", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Whatever Title" }),
      }),
      { params: Promise.resolve({ id: "does-not-exist" }) },
    );
    expect(res.status).toBe(404);
  });
});
