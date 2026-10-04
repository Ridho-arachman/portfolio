// Unit test src/lib/relation-ids.ts: trust boundary untuk id many-to-many dan
// `Project.categoryId`. Yang diuji adalah kontrak yang dilihat route — bukan
// query Prisma-nya: group kosong dilewati, id yang tidak dikenal disebutbyname,
// dan baris di-trash tetap dianggap valid supaya penyimpanan ulang tidak 400.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    project: { findMany: vi.fn() },
    certificate: { findMany: vi.fn() },
    experience: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
  },
}));

import prisma from "@/lib/prisma";
import { findUnknownRelationMessage } from "./relation-ids";

const found = (...ids: string[]) => vi.mocked(prisma.certificate.findMany)
  .mockResolvedValue(ids.map((id) => ({ id })) as Awaited<
    ReturnType<typeof prisma.certificate.findMany>
  >);

describe("findUnknownRelationMessage", () => {
  beforeEach(() => {
    vi.mocked(prisma.certificate.findMany).mockReset();
    vi.mocked(prisma.experience.findMany).mockReset();
    vi.mocked(prisma.category.findMany).mockReset();
  });

  it("returns null when every id resolves", async () => {
    found("c1", "c2");

    const message = await findUnknownRelationMessage([
      { label: "certificate", model: "certificate", ids: ["c1", "c2"] },
    ]);

    expect(message).toBeNull();
  });

  it("names only the ids that do not exist", async () => {
    found("c1");

    const message = await findUnknownRelationMessage([
      {
        label: "certificate",
        model: "certificate",
        ids: ["c1", "ghost-a", "ghost-b"],
      },
    ]);

    expect(message).toBe("Unknown certificate ids: ghost-a, ghost-b");
  });

  it("reports the first failing group so the message stays specific", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue(
      [] as Awaited<ReturnType<typeof prisma.category.findMany>>,
    );

    const message = await findUnknownRelationMessage([
      { label: "category", model: "category", ids: ["missing-cat"] },
      { label: "certificate", model: "certificate", ids: ["c1"] },
    ]);

    expect(message).toBe("Unknown category ids: missing-cat");
    // Group kedua tidak boleh di-query setelah group pertama gagal.
    expect(prisma.certificate.findMany).not.toHaveBeenCalled();
  });

  it("skips absent and empty groups without querying", async () => {
    const message = await findUnknownRelationMessage([
      { label: "certificate", model: "certificate", ids: undefined },
      { label: "experience", model: "experience", ids: [] },
    ]);

    expect(message).toBeNull();
    expect(prisma.certificate.findMany).not.toHaveBeenCalled();
    expect(prisma.experience.findMany).not.toHaveBeenCalled();
  });

  // Filter `deletedAt` di sini akan membuat 400 setiap kali form menyimpan
  // ulang entitas yang masih tertaut ke baris di-trash, karena `set` pada
  // relasi m-n mengganti seluruh tautan.
  it("looks ids up without a deletedAt filter so trashed rows stay valid targets", async () => {
    found("c1");

    await findUnknownRelationMessage([
      { label: "certificate", model: "certificate", ids: ["c1"] },
    ]);

    expect(
      vi.mocked(prisma.certificate.findMany).mock.calls[0]?.[0]?.where,
    ).toEqual({ id: { in: ["c1"] } });
  });
});