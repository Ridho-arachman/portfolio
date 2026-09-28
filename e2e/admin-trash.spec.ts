import { expect, test, type Page } from "@playwright/test";
import { E2E_ADMIN, loginAsEmail, prisma, seedAdminViaApi } from "./helpers/admin-auth";

// Prefiks slug stabil: dipakai untuk teardown hard delete, jadi row yang
// tertinggal dari run yang gagal sebelumnya ikut bersih dan suite bisa diulang.
// Token per-run hanya menjaga agar dua run tidak-create slug yang sama.
const SLUG_PREFIX = "e2e-trash-";
const RUN_TOKEN = `${Date.now().toString(36)}${Math.floor(
  Math.random() * 1e6,
).toString(36)}`;

const TARGET = {
  title: `E2E Trash Target ${RUN_TOKEN}`,
  slug: `${SLUG_PREFIX}target-${RUN_TOKEN}`,
};
const BYSTANDER = {
  title: `E2E Trash Bystander ${RUN_TOKEN}`,
  slug: `${SLUG_PREFIX}bystander-${RUN_TOKEN}`,
};

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
}

// Dibuat lewat API admin, bukan Prisma: endpoint itu memanggil
// `revalidateTag("projects")`, sedangkan halaman publik `/en/projects` baca dari
// `unstable_cache`. Row yang disisipkan langsung ke DB tidak akan invalidate
// cache itu dan test "sebelum dihapus" akan salah gagal.
function projectPayload(project: { title: string; slug: string }) {
  return {
    title: project.title,
    slug: project.slug,
    description: "Row yang dibuat oleh spec admin-trash end-to-end.",
    thumbnail: "https://placeholder.example.com/cover.jpg",
    technologies: ["Playwright"],
    gallery: [],
    highlights: [],
    isPublished: true,
    // order 0 mengembalikan baris ini ke halaman 1 daftar publik, yang
    // hanya_render 6 project per halaman.
    order: 0,
  };
}

async function createProject(page: Page, project: { title: string; slug: string }) {
  const response = await page.request.post("/api/admin/projects", {
    data: projectPayload(project),
  });
  expect(response.status(), "seed project harus dibuat").toBe(201);
  const body = (await response.json()) as { data: ProjectRow };
  return body.data;
}

// `page.request` memakai context yang sama dengan browser, jadi cookie sesi
// admin hasil login di browser ikut terpakai tanpa setup storageState lagi.
async function softDelete(page: Page, id: string) {
  const response = await page.request.delete(`/api/admin/projects/${id}`);
  expect(response.status(), "soft delete harus sukses").toBe(200);
}

async function purge(page: Page, id: string, confirm: boolean) {
  return page.request.delete(
    `/api/admin/projects/${id}/purge${confirm ? "?confirm=true" : ""}`,
  );
}

async function trashedSlugs(page: Page, search: string) {
  const response = await page.request.get(
    `/api/admin/projects?trashed=true&search=${encodeURIComponent(search)}`,
  );
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { data: ProjectRow[] };
  return body.data.map((row) => row.slug);
}

// Cek lewat endpoint publik, bukan render halaman: endpoint itu memfilter
// `isPublished` + `notDeleted` di server, jadi ini persis klaim spec — row
// tidak terlihat publik begitu di-trash — dan tidak perlu menunggu render ulang
// /en/projects yang meng-compile on-demand di dev server. Render lewat browser
// tetap dipakai untuk URL detail dan untuk layar Trash.
async function publicListShows(page: Page, slug: string, count: number) {
  const response = await page.request.get("/api/public/projects?pageSize=100");
  const body = (await response.json()) as { data: { slug: string }[] };
  expect(
    body.data.filter((project) => project.slug === slug),
    `kemunculan ${slug} di daftar publik`,
  ).toHaveLength(count);
}

function trashRow(page: Page, title: string) {
  return page.getByRole("listitem").filter({ hasText: title });
}

async function openTrash(page: Page) {
  await page.goto("/admin/trash");
  await expect(
    page.getByRole("heading", { level: 1, name: "Trash" }),
  ).toBeVisible({ timeout: 60_000 });
  // Server memfilter `title contains` dan mengabaikan baris lain, jadi
  // assertion tidak ikutavana kalau trash berisi sisa run sebelumnya.
  await page.getByPlaceholder("Search trash...").fill(RUN_TOKEN);
}

test.beforeEach(async ({ request }) => {
  await seedAdminViaApi(request);
});

test.afterEach(async () => {
  // Hard delete: `deleteMany` sengaja tidak jadi soft delete supaya baris
  // tidak bocor ke run berikutnya (lihat catatan di src/lib/soft-delete.ts).
  await prisma.project.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
});

test("soft-deleting a project hides it from the public site and files it in the trash", async ({
  page,
}) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  await createProject(page, TARGET);
  await createProject(page, BYSTANDER);

  await publicListShows(page, TARGET.slug, 1);
  await publicListShows(page, BYSTANDER.slug, 1);

  await page.goto("/admin/projects");
  await page.getByPlaceholder("Search projects...").fill(RUN_TOKEN);
  const adminRow = page.getByRole("listitem").filter({ hasText: TARGET.title });
  await expect(adminRow).toBeVisible();
  await adminRow.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Ya, Hapus" }).click();
  await expect(adminRow).toHaveCount(0);

  // Halaman detailnya dibaca Prisma tanpa cache, jadi 404 di sini membuktikan
  // barisnya benar-benar tidak publik — bukan sekadar tersembunyi di daftar.
  const detail = await page.goto(`/en/projects/${TARGET.slug}`);
  expect(detail?.status()).toBe(404);

  await publicListShows(page, TARGET.slug, 0);
  await publicListShows(page, BYSTANDER.slug, 1);

  await openTrash(page);
  const row = trashRow(page, TARGET.title);
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: "Restore" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Delete forever" })).toBeVisible();
  await expect(trashRow(page, BYSTANDER.title)).toHaveCount(0);
});

test("restoring a trashed project puts it back on the public site", async ({
  page,
}) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  const target = await createProject(page, TARGET);
  await createProject(page, BYSTANDER);
  await softDelete(page, target.id);
  await publicListShows(page, TARGET.slug, 0);

  await openTrash(page);
  const row = trashRow(page, TARGET.title);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Restore" }).click();
  await expect(row).toHaveCount(0);

  await publicListShows(page, TARGET.slug, 1);
  const detail = await page.goto(`/en/projects/${TARGET.slug}`);
  expect(detail?.status()).toBe(200);
  await publicListShows(page, BYSTANDER.slug, 1);
  expect(await trashedSlugs(page, RUN_TOKEN)).toEqual([]);
});

test("purge needs confirm=true and survives a cancelled dialog, then destroys the row for good", async ({
  page,
}) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  const target = await createProject(page, TARGET);
  await createProject(page, BYSTANDER);
  await softDelete(page, target.id);

  // Kasus negatif lewat `request`: 400 tanpa `confirm=true` adalah kontrak API,
  // lebih murah dan lebih tegas dicek daripada lewat dialog.
  expect((await purge(page, target.id, false)).status()).toBe(400);
  expect(await trashedSlugs(page, RUN_TOKEN)).toEqual([TARGET.slug]);

  await openTrash(page);
  const row = trashRow(page, TARGET.title);
  await row.getByRole("button", { name: "Delete forever" }).click();
  await expect(page.getByText("Delete forever?")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Delete forever?")).toHaveCount(0);
  await expect(row).toBeVisible();
  expect(await trashedSlugs(page, RUN_TOKEN)).toEqual([TARGET.slug]);

  await row.getByRole("button", { name: "Delete forever" }).click();
  await page.getByRole("button", { name: "Yes, delete forever" }).click();
  await expect(row).toHaveCount(0);

  expect((await purge(page, target.id, true)).status()).toBe(404);
  expect(await trashedSlugs(page, RUN_TOKEN)).toEqual([]);
  expect(
    (await page.goto(`/en/projects/${TARGET.slug}`))?.status(),
  ).toBe(404);
  await publicListShows(page, TARGET.slug, 0);
  await publicListShows(page, BYSTANDER.slug, 1);
});

test("a trashed project keeps holding its slug until it is purged", async ({
  page,
}) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  const target = await createProject(page, TARGET);
  await softDelete(page, target.id);

  const blocked = await page.request.post("/api/admin/projects", {
    data: projectPayload(TARGET),
  });
  expect(blocked.status(), "slug masih dipegang baris di trash").toBe(409);
  expect((await blocked.json()) as { error: string }).toHaveProperty(
    "error",
    "This value is still held by a trashed Project. Restore it or purge it from the trash first.",
  );

  expect((await purge(page, target.id, true)).status()).toBe(200);

  const reused = await page.request.post("/api/admin/projects", {
    data: projectPayload(TARGET),
  });
  expect(reused.status(), "setelah purge slug harus bisa dipakai lagi").toBe(201);
  const body = (await reused.json()) as { data: ProjectRow };
  expect(body.data.slug).toBe(TARGET.slug);
  expect(body.data.id).not.toBe(target.id);
});
