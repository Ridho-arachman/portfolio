// Integration test for the soft-delete read filter and the trash lifecycle.
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
import {
  GET as adminProjectsList,
  POST as adminCreateProject,
} from "@/app/api/admin/projects/route";
import {
  GET as adminProjectById,
  DELETE as adminDeleteProject,
} from "@/app/api/admin/projects/[id]/route";
import { POST as adminRestoreProject } from "@/app/api/admin/projects/[id]/restore/route";
import { DELETE as adminPurgeProject } from "@/app/api/admin/projects/[id]/purge/route";
import { GET as dashboardStats } from "@/app/api/admin/dashboard-stats/route";
import { GET as adminCategoriesList } from "@/app/api/admin/categories/route";
import { DELETE as adminDeleteCategory } from "@/app/api/admin/categories/[id]/route";
import { GET as adminSkillsList } from "@/app/api/admin/skills/route";
import { DELETE as adminDeleteSkill } from "@/app/api/admin/skills/[id]/route";
import { GET as adminExperienceList } from "@/app/api/admin/experience/route";
import { DELETE as adminDeleteExperience } from "@/app/api/admin/experience/[id]/route";
import { GET as adminCertificatesList } from "@/app/api/admin/certificates/route";
import { DELETE as adminDeleteCertificate } from "@/app/api/admin/certificates/[id]/route";
import { GET as adminMessagesList } from "@/app/api/admin/messages/route";
import { DELETE as adminDeleteMessage } from "@/app/api/admin/messages/[id]/route";

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

function adminList(query = "?pageSize=100") {
  return adminProjectsList(
    new Request(`http://localhost/api/admin/projects${query}`),
  );
}

function adminDetail(id: string) {
  return adminProjectById(
    new Request(`http://localhost/api/admin/projects/${id}`),
    { params: Promise.resolve({ id }) },
  );
}

function adminDelete(id: string) {
  return adminDeleteProject(
    new Request(`http://localhost/api/admin/projects/${id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id }) },
  );
}

function adminRestore(id: string) {
  return adminRestoreProject(
    new Request(`http://localhost/api/admin/projects/${id}/restore`, {
      method: "POST",
    }),
    { params: Promise.resolve({ id }) },
  );
}

function adminPurge(id: string, query = "") {
  return adminPurgeProject(
    new Request(`http://localhost/api/admin/projects/${id}/purge${query}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ id }) },
  );
}

function adminCreateProjectBody(slug: string) {
  return adminCreateProject(
    new Request("http://localhost/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(projectData({ slug })),
    }),
  );
}

const slugsIn = (payload: { data: Array<{ slug: string }> }) =>
  payload.data.map((p) => p.slug);

const idsIn = (payload: { data: Array<{ id: string }> }) =>
  payload.data.map((p) => p.id);

const slug = (suffix: string) => `${projectSlug}-${suffix}`;

beforeAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.message.deleteMany({ where: { email: { startsWith: prefix } } });
  await cleanupExtraRows();
});

afterAll(async () => {
  // `deleteMany` tetap hard delete: soft delete di sini first-party, bukan
  // extension, jadi teardown yang sudah ada tidak perlu berubah.
  await prisma.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.message.deleteMany({ where: { email: { startsWith: prefix } } });
  await cleanupExtraRows();
  await prisma.$disconnect();
});

// Baris tambahan yang di-seed test trash-lifecycle per entitas. Teardown asli
// di atas tidak boleh disentuh, jadi pembersihannya dipisah di sini.
//
// `startsWith` untuk category juga menutup `${categorySlug}-live` dari test
// "tidak menaruh deletedAt ke payload category": teardown asli hanya menghapus
// slug persis, jadi baris itu bocor satu per run sampai menumpuk di page 1 dan
// membuat suite categories gagal.
async function cleanupExtraRows() {
  await prisma.experience.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.certificate.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.skill.deleteMany({ where: { name: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: categorySlug } } });
}

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

describe("trash lifecycle: Project", () => {
  async function seedTrashed(suffix: string) {
    const created = await prisma.project.create({
      data: projectData({ slug: slug(suffix) }),
    });
    const res = await adminDelete(created.id);
    expect(res.status).toBe(200);
    return created;
  }

  it("DELETE menyisakan baris dengan deletedAt dan hilang dari API publik", async () => {
    const created = await prisma.project.create({
      data: projectData({ slug: slug("delete") }),
    });

    expect(slugsIn(await (await publicList()).json())).toContain(created.slug);

    const res = await adminDelete(created.id);
    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toContain("trash");

    // Baris tetap ada supaya bisa di-restore; yang hilang adalah kemunculannya.
    const row = await prisma.project.findUnique({ where: { id: created.id } });
    expect(row?.deletedAt).toBeInstanceOf(Date);
    expect((await publicDetail(created.slug)).status).toBe(404);
    expect(slugsIn(await (await publicList()).json())).not.toContain(created.slug);
  });

  it("?trashed=true memindahkan baris ke listing trash, default tidak", async () => {
    const created = await seedTrashed("listing");

    const trashed = await (await adminList("?trashed=true&pageSize=100")).json();
    expect(idsIn(trashed)).toContain(created.id);

    const live = await (await adminList()).json();
    expect(idsIn(live)).not.toContain(created.id);
  });

  it("restore mengembalikan baris dan API publik melihatnya lagi", async () => {
    const created = await seedTrashed("restore");

    const res = await adminRestore(created.id);
    expect(res.status).toBe(200);

    const row = await prisma.project.findUnique({ where: { id: created.id } });
    expect(row?.deletedAt).toBeNull();
    expect((await publicDetail(created.slug)).status).toBe(200);
    expect(slugsIn(await (await publicList()).json())).toContain(created.slug);
  });

  it("purge menolak tanpa confirm=true, dan dengan confirm barisnya hilang", async () => {
    const created = await seedTrashed("purge");

    const refused = await adminPurge(created.id);
    expect(refused.status).toBe(400);
    expect(
      await prisma.project.findUnique({ where: { id: created.id } }),
    ).not.toBeNull();

    const purged = await adminPurge(created.id, "?confirm=true");
    expect(purged.status).toBe(200);
    expect(await prisma.project.findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("restore dan purge pada baris yang tidak di-trash sama-sama 404", async () => {
    const live = await prisma.project.create({
      data: projectData({ slug: slug("still-live") }),
    });

    expect((await adminRestore(live.id)).status).toBe(404);
    expect((await adminPurge(live.id, "?confirm=true")).status).toBe(404);
    // Id yang benar-benar tidak ada berakhir sama, jadi 404 itu bukan kebetulan.
    expect((await adminRestore("does-not-exist")).status).toBe(404);
    expect((await adminPurge("does-not-exist", "?confirm=true")).status).toBe(404);
    expect(live.deletedAt).toBeNull();
  });

  it("slug yang di-trash tetap direservasi sampai di-purge", async () => {
    const created = await seedTrashed("reserved");

    const conflict = await adminCreateProjectBody(created.slug);
    expect(conflict.status).toBe(409);
    expect((await conflict.json()).error).toContain("trashed Project");

    expect((await adminPurge(created.id, "?confirm=true")).status).toBe(200);

    // Setelah purge baris benar-benar hilang, jadi slug-nya boleh dipakai lagi.
    const recreated = await adminCreateProjectBody(created.slug);
    expect(recreated.status).toBe(201);
    expect((await recreated.json()).data.slug).toBe(created.slug);
  });
});

// Kasus murah per entitas: satu test untuk memastikan `?trashed=true` ada di
// keenam list route dan tidak bocor ke listing default. Project diuji penuh di
// describe di atas, jadi di sini yang dicek hanya cabang trash-nya.
const otherEntities = [
  {
    label: "categories",
    seed: () =>
      prisma.category.create({
        data: { name: `${prefix} Cat Extra`, slug: `${categorySlug}-extra` },
      }),
    remove: (id: string) =>
      adminDeleteCategory(
        new Request(`http://localhost/api/admin/categories/${id}`, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id }) },
      ),
    list: (query: string) =>
      adminCategoriesList(
        new Request(`http://localhost/api/admin/categories${query}`),
      ),
  },
  {
    label: "skills",
    seed: () =>
      prisma.skill.create({
        data: {
          name: `${prefix} Skill Extra`,
          category: "BACKEND",
          proficiency: 50,
        },
      }),
    remove: (id: string) =>
      adminDeleteSkill(
        new Request(`http://localhost/api/admin/skills/${id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id }) },
      ),
    list: (query: string) =>
      adminSkillsList(new Request(`http://localhost/api/admin/skills${query}`)),
  },
  {
    label: "experience",
    seed: () =>
      prisma.experience.create({
        data: {
          slug: `${prefix}-experience-extra`,
          title: `${prefix} Intern`,
          company: "Acme",
          type: "WORK",
          location: "Jakarta",
          startDate: new Date("2024-01-01"),
          description: [],
          gallery: [],
        },
      }),
    remove: (id: string) =>
      adminDeleteExperience(
        new Request(`http://localhost/api/admin/experience/${id}`, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id }) },
      ),
    list: (query: string) =>
      adminExperienceList(
        new Request(`http://localhost/api/admin/experience${query}`),
      ),
  },
  {
    label: "certificates",
    seed: () =>
      prisma.certificate.create({
        data: {
          slug: `${prefix}-certificate-extra`,
          title: `${prefix} Cert`,
          issuer: "Acme",
          issueDate: new Date("2024-01-01"),
          gallery: [],
          skills: [],
          summary: [],
        },
      }),
    remove: (id: string) =>
      adminDeleteCertificate(
        new Request(`http://localhost/api/admin/certificates/${id}`, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id }) },
      ),
    list: (query: string) =>
      adminCertificatesList(
        new Request(`http://localhost/api/admin/certificates${query}`),
      ),
  },
  {
    label: "messages",
    seed: () =>
      prisma.message.create({
        data: {
          name: "Extra",
          email: `${prefix}-extra@example.com`,
          subject: "Extra",
          content: "Baris tambahan untuk trash listing.",
        },
      }),
    remove: (id: string) =>
      adminDeleteMessage(
        new Request(`http://localhost/api/admin/messages/${id}`, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id }) },
      ),
    list: (query: string) =>
      adminMessagesList(new Request(`http://localhost/api/admin/messages${query}`)),
  },
] as const;

describe.each(otherEntities)("trash listing: $label", ({ seed, remove, list }) => {
  it("hanya muncul di ?trashed=true, bukan di listing default", async () => {
    const row = await seed();

    const deleted = await remove(row.id);
    expect(deleted.status).toBe(200);
    expect((await deleted.json()).data.message).toContain("trash");

    const trashed = await (await list("?trashed=true&pageSize=100")).json();
    expect(idsIn(trashed)).toContain(row.id);

    const live = await (await list("?pageSize=100")).json();
    expect(idsIn(live)).not.toContain(row.id);
  });
});
