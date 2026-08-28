// Integration tests for /api/admin/experience (+ [id]) against a real Postgres.
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

const unique = Date.now();
const prefix = `it-exp-${unique}`;
const mockedRequire = vi.mocked(requireAdminSession);

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title: `${prefix} Frontend Engineer`,
    company: "Tech Corp",
    type: "WORK",
    location: "Remote",
    startDate: "2024-01-01",
    isCurrent: true,
    description: ["Built design system"],
    gallery: [],
    isPublished: true,
    order: 1,
    ...overrides,
  };
}

function post(body: unknown) {
  return createRoute(
    new Request("http://localhost/api/admin/experience", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await prisma.experience.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
});

afterAll(async () => {
  await prisma.experience.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue(
    {} as unknown as Awaited<ReturnType<typeof requireAdminSession>>,
  );
});

describe("POST /api/admin/experience", () => {
  it("creates an experience entry and persists it", async () => {
    const res = await post(validBody());

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.slug).toBe(`${prefix}-frontend-engineer`);

    const row = await prisma.experience.findUnique({
      where: { slug: `${prefix}-frontend-engineer` },
    });
    expect(row?.company).toBe("Tech Corp");
    expect(row?.type).toBe("WORK");
  });

  it("rejects an invalid type with 400", async () => {
    const res = await post(validBody({ type: "INTERNSHIP" }));
    expect(res.status).toBe(400);
  });

  it("maps a duplicate slug (P2002) to a 409 conflict", async () => {
    await post(validBody());
    const res = await post(validBody());

    expect(res.status).toBe(409);
  });

  it("returns 404 when deleting an unknown id", async () => {
    const { DELETE: deleteRoute } = await import("./[id]/route");
    const res = await deleteRoute(
      new Request("http://localhost/api/admin/experience/does-not-exist", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "does-not-exist" }) },
    );
    expect(res.status).toBe(404);
  });
});
