// Integration test for the soft-delete read filter.
//
// S3/S4 filtered every read, so the guarantee worth locking is asymmetric:
// baris yang di-trash HARUS hilang dari API publik, tapi BARISNYA HARUS tetap
// ada supaya admin bisa restore (S5) dan purge (S6). Navigation view-nya belum
// ada di tahap ini, jadi "masih terlihat di admin" diuji lewat baris mentah di
// database, bukan lewat response route admin.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { GET as publicProjectsList } from "@/app/api/public/projects/route";
import { GET as publicProjectBySlug } from "@/app/api/public/projects/[slug]/route";
import { GET as adminProjectsList } from "@/app/api/admin/projects/route";
import { GET as adminProjectById } from "@/app/api/admin/projects/[id]/route";
import { GET as dashboardStats } from "@/app/api/admin/dashboard-stats/route";

const unique = Date.now();
const prefix = `it-sd-${unique}`;
const categorySlug = `${prefix}-cat`;
const projectSlug = `${prefix}-visible`;

vi.mocked(requireAdminSession).mockResolvedValue({
  user: { id: "test-admin-id", role: "ADMIN" },
} as unknown as Awaited<ReturnType<typeof requireAdminSession>>);

function projectData(overrides: Record<string, unknown> = {}) {
  return {
    title: `${prefix} Project`,
    slug: projectSlug,
    description: "A description long enough for the integration test.",
    thumbnail: "https://images.example.com/cover.jpg",
    technologies: ["Next.js"],
    gallery: [],
    highlights: ["Typed"],
    isPublished: true,
    order: 1,
    ...overrides,
  };
}

function publicList() {
  return publicProjectsList(
    new Request("http://localhost/api/public/projects?pageSize=100"),
  );
}

function publicDetail(slug: string) {
  return publicProjectBySlug(
    new Request(`http://localhost/api/public/projects/${slug}`),
    { params: Promise.resolve({ slug }) },
  );
}

function adminList() {
  return adminProjectsList(
    new Request("http://localhost/api/admin/projects?pageSize=100"),
  );
}

function adminDetail(id: string) {
  return adminProjectById(
    new Request(`http://localhost/api/admin/projects/${id}`),
    { params: Promise.resolve({ id }) },
  );
}

const slugsIn = (payload: { data: Array<{ slug: string }> }) =>
  payload.data.map((p) => p.slug);

beforeAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.message.deleteMany({ where: { email: { startsWith: prefix } } });
});

afterAll(async () => {
  // `deleteMany` tetap hard delete: soft delete di sini first-party, bukan
  // extension, jadi teardown yang sudah ada tidak perlu berubah.
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.message.deleteMany({ where: { email: { startsWith: prefix } } });
  await prisma.$disconnect();
});

describe("soft-deleted project", () => {
  it("hilang dari API publik tapi barisnya utuh untuk restore", async () => {
    const created = await prisma.project.create({ data: projectData() });

    const before = await (await publicList()).json();
    expect(slugsIn(before)).toContain(projectSlug);
    expect((await publicDetail(projectSlug)).status).toBe(200);

    await prisma.project.update({
      where: { id: created.id },
      data: { deletedAt: new Date() },
    });

    expect((await publicDetail(projectSlug)).status).toBe(404);
    expect(slugsIn(await (await publicList()).json())).not.toContain(projectSlug);

    // Route admin juga sudah disaring di S4, jadi trash view (S6) belum ada:
    // yang dibuktikan di sini barisnya masih bisa dipanggil S5 untuk restore.
    expect(slugsIn(await (await adminList()).json())).not.toContain(projectSlug);
    expect((await adminDetail(created.id)).status).toBe(404);

    const row = await prisma.project.findUnique({ where: { id: created.id } });
    expect(row).not.toBeNull();
    expect(row?.deletedAt).toBeInstanceOf(Date);
  });

  it("category yang di-trash resolveu menjadi null di jalur baca publik", async () => {
    const category = await prisma.category.create({
      data: { name: `${prefix} Category`, slug: categorySlug },
    });
    const project = await prisma.project.create({
      data: projectData({ slug: `${projectSlug}-with-cat`, categoryId: category.id }),
    });

    await prisma.category.update({
      where: { id: category.id },
      data: { deletedAt: new Date() },
    });

    const res = await publicDetail(`${projectSlug}-with-cat`);
    expect(res.status).toBe(200);
    const json = await res.json();

    // `categoryId` masih menunjuk ke baris yang sama, jadi `null` di
    // `category` memang hasil filter relasi, bukan relasi yang hilang.
    expect(json.data.categoryId).toBe(category.id);
    expect(json.data.category).toBeNull();
    expect(project.categoryId).toBe(category.id);
  });

  it("tidak menaruh deletedAt ke payload category", async () => {
    const category = await prisma.category.create({
      data: { name: `${prefix} Live Category`, slug: `${categorySlug}-live` },
    });
    const project = await prisma.project.create({
      data: projectData({ slug: `${projectSlug}-live-cat`, categoryId: category.id }),
    });

    const json = await (await publicDetail(`${projectSlug}-live-cat`)).json();

    expect(json.data.category).not.toBeNull();
    expect(Object.keys(json.data.category)).not.toContain("deletedAt");
    expect(project.categoryId).toBe(category.id);
  });
});

describe("dashboard-stats", () => {
  it("tidak menghitung pesan NEW yang sudah di-trash", async () => {
    const live = await prisma.message.create({
      data: {
        name: "Live",
        email: `${prefix}-live@example.com`,
        subject: "Live",
        content: "Belum di-trash.",
      },
    });
    const trashed = await prisma.message.create({
      data: {
        name: "Trashed",
        email: `${prefix}-trashed@example.com`,
        subject: "Trashed",
        content: "Sudah di-trash.",
      },
    });
    await prisma.message.update({
      where: { id: trashed.id },
      data: { deletedAt: new Date() },
    });

    const unfilteredNew = await prisma.message.count({ where: { status: "NEW" } });
    const filteredNew = await prisma.message.count({
      where: { status: "NEW", deletedAt: null },
    });

    // Prasyarat: pesan yang baru saja di-trash benar-benar ada di database.
    expect(unfilteredNew).toBeGreaterThan(filteredNew);
    expect(filteredNew).toBeGreaterThanOrEqual(1);

    const json = await (await dashboardStats()).json();

    expect(json.data.unreadMessages).toBe(filteredNew);
    expect(json.data.unreadMessages).toBeLessThan(unfilteredNew);
    expect(live.deletedAt).toBeNull();
  });
});
