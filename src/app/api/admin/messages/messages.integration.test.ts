// Integration tests for /api/admin/messages/[id] against a real Postgres.
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import {
  GET as getOneRoute,
  PUT as updateRoute,
  DELETE as deleteRoute,
} from "./[id]/route";

const unique = Date.now();
const email = `it-msg-${unique}@example.com`;
const mockedRequire = vi.mocked(requireAdminSession);

async function seedMessage() {
  return prisma.message.create({
    data: {
      name: "Integration Sender",
      email,
      subject: `Inquiry ${unique}`,
      content: "Hello, this is an integration test message.",
    },
  });
}

afterAll(async () => {
  await prisma.message.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

beforeEach(() => {
  mockedRequire.mockResolvedValue({
    user: { id: "test-admin-id", role: "ADMIN" },
  } as unknown as Awaited<ReturnType<typeof requireAdminSession>>);
});

describe("/api/admin/messages/[id]", () => {
  it("returns a message by id", async () => {
    const seeded = await seedMessage();

    const res = await getOneRoute(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: seeded.id }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).data.subject).toBe(`Inquiry ${unique}`);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await getOneRoute(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });

  it("updates the triage status", async () => {
    const seeded = await seedMessage();

    const res = await updateRoute(
      new Request(`http://localhost/api/admin/messages/${seeded.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "REPLIED" }),
      }),
      { params: Promise.resolve({ id: seeded.id }) },
    );

    expect(res.status).toBe(200);
    const row = await prisma.message.findUnique({ where: { id: seeded.id } });
    expect(row?.status).toBe("REPLIED");
  });

  it("rejects an invalid status with 400", async () => {
    const seeded = await seedMessage();

    const res = await updateRoute(
      new Request(`http://localhost/api/admin/messages/${seeded.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "NOT_A_STATUS" }),
      }),
      { params: Promise.resolve({ id: seeded.id }) },
    );

    expect(res.status).toBe(400);
  });

  it("moves the message to trash instead of removing the row", async () => {
    const seeded = await seedMessage();

    const res = await deleteRoute(
      new Request(`http://localhost/api/admin/messages/${seeded.id}`, {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: seeded.id }) },
    );

    expect(res.status).toBe(200);
    const row = await prisma.message.findUnique({ where: { id: seeded.id } });
    expect(row).not.toBeNull();
    expect(row?.deletedAt).toBeInstanceOf(Date);
  });
});
