// Integration tests for /api/admin/categories (+ [id]) against a real Postgres.
// Session auth is mocked (covered by auth*.integration.test.ts); everything else
// runs the production path: zod schemas -> Prisma -> api-helpers/prisma-errors.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { GET as listRoute, POST as createRoute } from "./route";
import {
  GET as getOneRoute,
  PUT as updateRoute,
  DELETE as deleteRoute,
} from "./[id]/route";

const unique = Date.now();
const prefix = `it-cat-${unique}`;
const adminSession = { user: { id: "u1", role: "ADMIN" }, session: {} };
const mockedRequire = vi.mocked(requireAdminSession);

function post(body: unknown) {
  return createRoute(
    new Request("http://localhost/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

function withParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeAll(async () => {
  await prisma.category.deleteMany({ where: { slug: { startsWith: prefix } } });
});

afterAll(async () => {
  await prisma.category.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue(
    adminSession as unknown as Awaited<ReturnType<typeof requireAdminSession>>,
  );
});

describe("POST /api/admin/categories", () => {
  it("creates a category and persists it", async () => {
    const res = await post({ name: `${prefix} Web Dev`, order: 5 });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.slug).toBe(`${prefix}-web-dev`);

    const row = await prisma.category.findUnique({
      where: { slug: `${prefix}-web-dev` },
    });
    expect(row?.order).toBe(5);

    // `public-projects` di [lang]/(public)/projects/page.tsx menyematkan
    // `category.name` ke payload-nya, jadi perubahan kategori wajib
    // meng-invalidate cache itu. Tanpa tag ini, rename kategori baru terlihat
    // setelah TTL 3600s habis.
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("categories", {
      expire: 0,
    });
  });

  it("maps a duplicate slug (P2002) to a 409 that points at the trash", async () => {
    const res = await post({ name: `${prefix} Web Dev`, order: 1 });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("trashed Category");
    // Internal Prisma details must never leak.
    expect(json.error).not.toContain("prisma");
    expect(json.error).not.toContain("Unique constraint");
  });

  it("rejects an empty name with 400", async () => {
    const res = await post({ name: "" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when the session guard rejects", async () => {
    mockedRequire.mockRejectedValue(new Error("Unauthorized"));
    const res = await post({ name: `${prefix} forbidden` });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });
});

describe("GET /api/admin/categories", () => {
  it("lists categories with pagination metadata", async () => {
    const res = await listRoute(
      new Request("http://localhost/api/admin/categories?page=1&pageSize=10"),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination.page).toBe(1);
    expect(
      json.data.some((c: { slug: string }) => c.slug === `${prefix}-web-dev`),
    ).toBe(true);
  });

  it("filters by search term", async () => {
    await post({ name: `${prefix} Searchable`, order: 0 });

    const res = await listRoute(
      new Request(
        `http://localhost/api/admin/categories?page=1&search=${encodeURIComponent(`${prefix} Searchable`)}`,
      ),
    );

    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].slug).toBe(`${prefix}-searchable`);
  });
});

describe("GET/PUT/DELETE /api/admin/categories/[id]", () => {
  let categoryId: string;

  beforeAll(async () => {
    const row = await prisma.category.create({
      data: { name: `${prefix} Updatable`, slug: `${prefix}-updatable` },
    });
    categoryId = row.id;
  });

  it("returns 404 for an unknown id", async () => {
    const res = await getRouteSafe(getOneRoute, "does-not-exist");
    expect(res.status).toBe(404);
  });

  it("updates name and order", async () => {
    const res = await updateRoute(
      new Request(`http://localhost/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `${prefix} Renamed`, order: 9 }),
      }),
      withParams(categoryId),
    );

    expect(res.status).toBe(200);
    const row = await prisma.category.findUnique({ where: { id: categoryId } });
    expect(row?.name).toBe(`${prefix} Renamed`);
    expect(row?.order).toBe(9);
    expect(row?.slug).toBe(`${prefix}-renamed`);
  });

  it("moves the category to trash instead of removing the row", async () => {
    const res = await deleteRoute(
      new Request(`http://localhost/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      }),
      withParams(categoryId),
    );

    expect(res.status).toBe(200);
    const row = await prisma.category.findUnique({ where: { id: categoryId } });
    expect(row).not.toBeNull();
    expect(row?.deletedAt).toBeInstanceOf(Date);
  });
});

async function getRouteSafe(
  handler: (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>,
  id: string,
) {
  return handler(new Request(`http://localhost/api/admin/categories/${id}`), {
    params: Promise.resolve({ id }),
  });
}
