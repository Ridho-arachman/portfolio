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
let categoryId: string;

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
    // `Project.categoryId` NOT NULL + `Restrict`, jadi setiap create butuh
    // kategori yang benar-benar ada.
    categoryId,
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
  await prisma.category.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  const category = await prisma.category.create({
    data: { name: `${prefix} Web Dev`, slug: `${prefix}-web-dev` },
  });
  categoryId = category.id;
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  // `Restrict`: baris project harus hilang sebelum kategorinya boleh dihapus.
  await prisma.certificate.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  await prisma.experience.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  await prisma.category.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue({
    user: { id: "test-admin-id", role: "ADMIN" },
  } as unknown as Awaited<ReturnType<typeof requireAdminSession>>);
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

  it("maps a duplicate slug (P2002) to a 409 that points at the trash", async () => {
    const res = await post(validBody({ slug: `${prefix}-platform` }));

    expect(res.status).toBe(409);
    const json = await res.json();
    // Baris yang bentrok bisa saja sudah di-trash dan tidak terlihat di daftar
    // admin, jadi pesannya harus menyuruh ke trash, bukan sekadar "already exists".
    expect(json.error).toContain("trashed Project");
    expect(json.error).toMatch(/restore|purge/i);
    expect(json.error).not.toContain("prisma");
  });

  it("rejects an invalid thumbnail URL with 400", async () => {
    const res = await post(validBody({ thumbnail: "not-a-url" }));
    expect(res.status).toBe(400);
  });

  it("rejects a project with no category with 400", async () => {
    const res = await post(validBody({ categoryId: "" }));
    expect(res.status).toBe(400);
  });

  // Relasi m-n memakai tabel join implisit: tanpa pengecekan di trust boundary,
  // `connect` dengan id yang tidak ada akan succeeds dan menyimpan join row
  // yang menunjuk entitas fiktif.
  it("rejects unknown relation ids with 400 instead of a broken join row", async () => {
    const res = await post(
      validBody({ certificateIds: ["cert-does-not-exist"] }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe(
      "Unknown certificate ids: cert-does-not-exist",
    );
  });

  it("connects certificates and experiences and stores the category", async () => {
    const certificate = await prisma.certificate.create({
      data: {
        slug: `${prefix}-cert`,
        title: `${prefix} Cert`,
        issuer: "Issuer",
        issueDate: new Date("2024-01-01"),
        skills: [],
        summary: [],
      },
    });
    const experience = await prisma.experience.create({
      data: {
        slug: `${prefix}-exp`,
        title: `${prefix} Exp`,
        company: "Acme",
        type: "WORK",
        location: "Jakarta",
        startDate: new Date("2024-01-01"),
        description: [],
        gallery: [],
      },
    });

    const res = await post(
      validBody({
        slug: `${prefix}-linked`,
        certificateIds: [certificate.id],
        experienceIds: [experience.id],
      }),
    );

    expect(res.status).toBe(201);
    const row = await prisma.project.findUnique({
      where: { slug: `${prefix}-linked` },
      include: { certificates: true, experiences: true, category: true },
    });
    expect(row?.categoryId).toBe(categoryId);
    expect(row?.certificates.map((c) => c.id)).toEqual([certificate.id]);
    expect(row?.experiences.map((e) => e.id)).toEqual([experience.id]);
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
