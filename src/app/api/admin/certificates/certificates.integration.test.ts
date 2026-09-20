// Integration tests for /api/admin/certificates (+ [id]) against a real Postgres.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { POST as createRoute } from "./route";

const unique = Date.now();
const prefix = `it-cert-${unique}`;
const mockedRequire = vi.mocked(requireAdminSession);

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title: `${prefix} AWS Certificate`,
    issuer: "Amazon Web Services",
    issueDate: "2025-01-15",
    skills: ["AWS", "Cloud"],
    summary: ["Designed cloud architecture"],
    isPublished: true,
    order: 2,
    ...overrides,
  };
}

function post(body: unknown) {
  return createRoute(
    new Request("http://localhost/api/admin/certificates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await prisma.certificate.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
});

afterAll(async () => {
  await prisma.certificate.deleteMany({
    where: { slug: { startsWith: prefix } },
  });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue(
    {} as unknown as Awaited<ReturnType<typeof requireAdminSession>>,
  );
});

describe("POST /api/admin/certificates", () => {
  it("creates a certificate and persists it", async () => {
    const res = await post(validBody());

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.slug).toBe(`${prefix}-aws-certificate`);

    const row = await prisma.certificate.findUnique({
      where: { slug: `${prefix}-aws-certificate` },
    });
    expect(row?.issuer).toBe("Amazon Web Services");
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("certificates", { expire: 0 });
  });

  it("rejects a short issuer with 400", async () => {
    const res = await post(validBody({ issuer: "A" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown id on GET", async () => {
    const { GET: getOneRoute } = await import("./[id]/route");
    const res = await getOneRoute(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });
});
