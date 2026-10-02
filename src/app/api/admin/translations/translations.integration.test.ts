// Integration tests for /api/admin/translations against a real Postgres.
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  // `getMessages` dibungkus unstable_cache; di sini yang diperiksa adalah isi
  // DB-nya, jadi cache Next dilewati agar setiap panggilan membaca ulang.
  unstable_cache: <T>(fn: T) => fn,
}));

import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { getMessages } from "@/lib/translations";
import { LOCALES } from "@/lib/i18n";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import { requireAdminSession } from "@/lib/session";
import { GET as getRoute, PUT as putRoute } from "./route";
import { POST as resetRoute } from "./reset/route";

const mockedRequire = vi.mocked(requireAdminSession);

const OVERRIDE = { "hero.greeting": "Halo, saya Ada" };

function put(locale: string | null, body: unknown) {
  const query = locale === null ? "" : `?locale=${locale}`;
  return putRoute(
    new Request(`http://localhost/api/admin/translations${query}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

function reset(body: unknown) {
  return resetRoute(
    new Request(`http://localhost/api/admin/translations/reset`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

afterAll(async () => {
  await prisma.translation.deleteMany({ where: { locale: { in: [...LOCALES] } } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.translation.deleteMany({ where: { locale: { in: [...LOCALES] } } });
  mockedRequire.mockReset();
  mockedRequire.mockResolvedValue({
    user: { id: "test-admin-id", role: "ADMIN" },
  } as unknown as Awaited<ReturnType<typeof requireAdminSession>>);
});

describe("PUT /api/admin/translations", () => {
  it("persists a dotted patch and the public resolver serves the override", async () => {
    const res = await put("id", { values: OVERRIDE });

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.locale).toBe("id");
    expect(data.messages.hero.greeting).toBe(OVERRIDE["hero.greeting"]);
    expect(data.messages.hero.title).toBe(idMessages.hero.title);

    // Yang diuji di sini bukan bentuk response, tapi efeknya ke situs publik.
    const served = await getMessages("id");
    expect(served.hero.greeting).toBe(OVERRIDE["hero.greeting"]);

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("translations", { expire: 0 });
  });

  it("replaces the previous patch instead of merging into it", async () => {
    await put("en", { values: { "footer.tagline": "First" } });
    const res = await put("en", { values: OVERRIDE });

    expect(res.status).toBe(200);
    expect((await prisma.translation.findUnique({ where: { locale: "en" } }))?.values).toEqual(
      OVERRIDE,
    );
    expect((await getMessages("en")).footer.tagline).toBe(enMessages.footer.tagline);
  });

  it("rejects an unknown dotted key with 400 and never writes it", async () => {
    const res = await put("en", { values: { "hero.nonexistent": "x" } });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("nonexistent");
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects an empty translation value with 400", async () => {
    const res = await put("en", { values: { "hero.greeting": "" } });

    expect(res.status).toBe(400);
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects an unsupported locale with 400", async () => {
    const res = await put("fr", { values: OVERRIDE });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("locale");
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects a missing locale with 400", async () => {
    const res = await put(null, { values: OVERRIDE });

    expect(res.status).toBe(400);
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects an unauthenticated write with 401", async () => {
    mockedRequire.mockRejectedValueOnce(new Error("Unauthorized"));

    const res = await put("en", { values: OVERRIDE });

    expect(res.status).toBe(401);
    expect(await prisma.translation.count()).toBe(0);
  });

  it("accepts a matching expectedUpdatedAt and rejects a stale one with 409", async () => {
    await put("en", { values: OVERRIDE });
    const row = await prisma.translation.findUnique({ where: { locale: "en" } });
    const fresh = row?.updatedAt.toISOString() as string;

    const ok = await put("en", {
      values: { ...OVERRIDE, "nav.home": "Hi" },
      expectedUpdatedAt: fresh,
    });
    expect(ok.status).toBe(200);

    const stale = await put("en", {
      values: OVERRIDE,
      expectedUpdatedAt: new Date(Date.parse(fresh) - 1000).toISOString(),
    });
    expect(stale.status).toBe(409);
    expect((await stale.json()).error).toMatch(/changed since/i);
    // Tulis basi tidak boleh menimpa pemenang terakhir.
    expect((await prisma.translation.findUnique({ where: { locale: "en" } }))?.values).toEqual({
      ...OVERRIDE,
      "nav.home": "Hi",
    });
  });
});

describe("GET /api/admin/translations", () => {
  it("returns the effective messages and the raw patch for every locale", async () => {
    await put("en", { values: OVERRIDE });

    const res = await getRoute();

    expect(res.status).toBe(200);
    const { data } = await res.json();

    expect(data.map((entry: { locale: string }) => entry.locale)).toEqual([...LOCALES]);

    const [en, id] = data;
    // Effective = yang benar-benar dirender situs publik.
    expect(en.messages.hero.greeting).toBe(OVERRIDE["hero.greeting"]);
    // Raw patch = key yang benar-benar tersimpan; sisanya diwarisi.
    expect(en.patch).toEqual(OVERRIDE);
    expect(Object.keys(en.patch)).toHaveLength(1);

    // Locale tanpa row tetap dikembalikan, dengan dokumen bawaan utuh.
    expect(id.patch).toEqual({});
    expect(id.messages).toEqual(idMessages);
    // Token concurrency: null bila belum ada row, ISO string sesudah PUT.
    expect(id.updatedAt).toBeNull();
    expect(typeof en.updatedAt).toBe("string");
  });

  it("reflects a PUT override in a subsequent GET (write→read round-trip)", async () => {
    const putRes = await put("id", { values: OVERRIDE });
    expect(putRes.status).toBe(200);

    const getRes = await getRoute();
    expect(getRes.status).toBe(200);
    const { data } = await getRes.json();

    const id = data.find((entry: { locale: string }) => entry.locale === "id");
    expect(id.messages.hero.greeting).toBe(OVERRIDE["hero.greeting"]);
    expect(id.messages.hero.title).toBe(idMessages.hero.title);
    expect(id.patch).toEqual(OVERRIDE);
    expect(typeof id.updatedAt).toBe("string");

    // Public resolver serves the same override.
    expect((await getMessages("id")).hero.greeting).toBe(OVERRIDE["hero.greeting"]);
  });

  it("does not 500 on a stored patch whose key no longer exists in the bundled document", async () => {
    await prisma.translation.create({
      data: { locale: "en", values: { "hero.removedKey": "ghost" } },
    });

    const res = await getRoute();

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data[0].messages).toEqual(enMessages);
  });

  it("keeps the valid keys in GET when a stored patch mixes one stale key in", async () => {
    await prisma.translation.create({
      data: {
        locale: "en",
        values: { "hero.greeting": "Kept", "hero.removedKey": "ghost" },
      },
    });

    const res = await getRoute();

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data[0].messages.hero.greeting).toBe("Kept");
    expect(data[0].messages.hero.title).toBe(enMessages.hero.title);
  });
});

describe("POST /api/admin/translations/reset", () => {
  it("resets one locale back to bundled without touching the other", async () => {
    await put("en", { values: OVERRIDE });
    await put("id", { values: OVERRIDE });

    const res = await reset({ locale: "en" });

    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ reset: "en" });
    expect(await prisma.translation.findUnique({ where: { locale: "en" } })).toBeNull();
    expect(
      (await prisma.translation.findUnique({ where: { locale: "id" } }))?.values,
    ).toEqual(OVERRIDE);
    expect((await getMessages("en")).hero.greeting).toBe(enMessages.hero.greeting);
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("translations", { expire: 0 });
  });

  it("resets all locales when the body is empty", async () => {
    await put("en", { values: OVERRIDE });
    await put("id", { values: OVERRIDE });

    const res = await reset({});

    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ reset: "all" });
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects an unknown locale with 400", async () => {
    const res = await reset({ locale: "fr" });

    expect(res.status).toBe(400);
    expect(await prisma.translation.count()).toBe(0);
  });

  it("rejects an unauthenticated reset with 401", async () => {
    mockedRequire.mockRejectedValueOnce(new Error("Unauthorized"));

    const res = await reset({ locale: "en" });

    expect(res.status).toBe(401);
  });
});
