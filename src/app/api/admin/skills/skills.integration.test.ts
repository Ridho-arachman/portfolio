// Integration tests for /api/admin/skills (+ [id]) against a real Postgres.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { POST as createRoute } from "./route";
import {
  GET as getOneRoute,
  PUT as updateRoute,
  DELETE as deleteRoute,
} from "./[id]/route";

const unique = Date.now();
const prefix = `it-skill-${unique}`;
const mockedRequire = vi.mocked(requireAdminSession);

function post(body: unknown) {
  return createRoute(
    new Request("http://localhost/api/admin/skills", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await prisma.skill.deleteMany({ where: { name: { startsWith: prefix } } });
});

afterAll(async () => {
  await prisma.skill.deleteMany({ where: { name: { startsWith: prefix } } });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue({
    user: { id: "test-admin-id", role: "ADMIN" },
  } as unknown as Awaited<ReturnType<typeof requireAdminSession>>);
});

describe("POST /api/admin/skills", () => {
  it("creates a skill and persists it", async () => {
    const res = await post({
      name: `${prefix} React`,
      category: "FRONTEND",
      proficiency: 90,
      order: 1,
    });

    expect(res.status).toBe(201);
    const row = await prisma.skill.findUnique({ where: { name: `${prefix} React` } });
    expect(row?.proficiency).toBe(90);
    expect(row?.category).toBe("FRONTEND");
  });

  it("maps a duplicate name (P2002) to a 409 conflict", async () => {
    const res = await post({
      name: `${prefix} React`,
      category: "FRONTEND",
      proficiency: 50,
      order: 2,
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("trashed Skill");
  });

  it("rejects out-of-range proficiency with 400", async () => {
    const res = await post({
      name: `${prefix} Bad`,
      category: "FRONTEND",
      proficiency: 101,
      order: 0,
    });
    expect(res.status).toBe(400);
  });
});

describe("/api/admin/skills/[id]", () => {
  it("updates proficiency via PUT", async () => {
    const skill = await prisma.skill.create({
      data: { name: `${prefix} Editable`, category: "BACKEND", proficiency: 40, order: 3 },
    });

    const res = await updateRoute(
      new Request(`http://localhost/api/admin/skills/${skill.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proficiency: 75 }),
      }),
      { params: Promise.resolve({ id: skill.id }) },
    );

    expect(res.status).toBe(200);
    const row = await prisma.skill.findUnique({ where: { id: skill.id } });
    expect(row?.proficiency).toBe(75);
  });

  it("returns 404 for an unknown id on DELETE", async () => {
    const res = await deleteRoute(
      new Request("http://localhost/api/admin/skills/does-not-exist", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "does-not-exist" }) },
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id on GET", async () => {
    const res = await getOneRoute(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });
});
