// Integration tests for /api/admin/settings (+ /settings/reset) against a real Postgres.
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  // Resolver-nya sudah diuji sebagai unit test; di sini yang diuji adalah
  // I/O-nya, jadi cache Next dilewati agar setiap request membaca DB.
  unstable_cache: <T>(fn: T) => fn,
}));

import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { DEFAULT_QUICK_LINK_KEYS, envSiteSettings, SITE_SETTINGS_ID } from "@/lib/settings";
import { requireAdminSession } from "@/lib/session";
import { GET as getRoute, PUT as putRoute } from "./route";
import { POST as resetRoute } from "./reset/route";

const mockedRequire = vi.mocked(requireAdminSession);

function request(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const get = () => getRoute();
const put = (body: unknown) =>
  putRoute(request("http://localhost/api/admin/settings", "PUT", body));
const reset = (body?: unknown) =>
  resetRoute(request("http://localhost/api/admin/settings/reset", "POST", body));

const readRow = () => prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });

afterAll(async () => {
  await prisma.siteSettings.deleteMany({ where: { id: SITE_SETTINGS_ID } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Baris singleton ikut state test lain kalau tidak dibersihkan di sini.
  await prisma.siteSettings.deleteMany({ where: { id: SITE_SETTINGS_ID } });
  mockedRequire.mockReset();
  mockedRequire.mockResolvedValue({
    user: { id: "test-admin-id", role: "ADMIN" },
  } as unknown as Awaited<ReturnType<typeof requireAdminSession>>);
});

describe("GET /api/admin/settings", () => {
  it("returns the resolved env values with no null and no blank string", async () => {
    const res = await get();

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data).toEqual(envSiteSettings());

    for (const key of Object.keys(envSiteSettings())) {
      if (key === "quickLinks") {
        expect(data[key], "quickLinks must be the default nav").toEqual([
          ...DEFAULT_QUICK_LINK_KEYS,
        ]);
      } else {
        expect(data[key], `${key} must be a non-empty string`).toEqual(expect.any(String));
        expect(data[key].length, `${key} must not be blank`).toBeGreaterThan(0);
      }
    }
  });
});

describe("PUT /api/admin/settings", () => {
  it("persists an override, returns it resolved, and leaves unsent groups untouched", async () => {
    const res = await put({ profile: { fullName: "Ada Lovelace" } });

    expect(res.status).toBe(200);
    expect((await res.json()).data.fullName).toBe("Ada Lovelace");

    const row = await readRow();
    expect(row?.fullName).toBe("Ada Lovelace");
    // Grup yang tidak ikut dikirim tidak boleh ditulis ulang jadi null.
    expect(row?.githubUrl).toBeNull();
    expect(row?.siteName).toBeNull();

    const after = await (await get()).json();
    expect(after.data.fullName).toBe("Ada Lovelace");
    expect(after.data.jobTitle).toBe(envSiteSettings().jobTitle);

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("site-settings", { expire: 0 });
  });

  it("stores each group in its own columns", async () => {
    await put({
      socials: { githubUrl: "https://github.com/ada", twitterUrl: "https://x.com/ada" },
      site: { siteUrl: "https://ada.dev" },
      quickLinks: ["contact", "home"],
    });

    const row = await readRow();
    expect(row?.githubUrl).toBe("https://github.com/ada");
    expect(row?.twitterUrl).toBe("https://x.com/ada");
    expect(row?.siteUrl).toBe("https://ada.dev");
    expect(row?.quickLinks).toEqual(["contact", "home"]);
  });

  it("rejects a blank value so it can never blank the public site", async () => {
    const res = await put({ profile: { fullName: "   " } });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("cannot be empty");
    expect(await readRow()).toBeNull();
  });

  it("rejects a nav key outside the canonical six with 400", async () => {
    const res = await put({ quickLinks: ["pricing"] });

    expect(res.status).toBe(400);
    expect(await readRow()).toBeNull();
  });

  it("rejects an unauthenticated write with 401", async () => {
    mockedRequire.mockRejectedValueOnce(new Error("Unauthorized"));

    const res = await put({ profile: { fullName: "Ada Lovelace" } });

    expect(res.status).toBe(401);
    expect(await readRow()).toBeNull();
  });
});

describe("POST /api/admin/settings/reset", () => {
  const overrideEverything = () =>
    put({
      profile: { fullName: "Ada Lovelace", contactEmail: "ada@example.com" },
      socials: { githubUrl: "https://github.com/ada" },
      site: { siteName: "ada.dev", siteUrl: "https://ada.dev" },
      quickLinks: ["home"],
    });

  it("nulls every value column when section is omitted, so GET serves the env values", async () => {
    await overrideEverything();

    const res = await reset({});

    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(envSiteSettings());

    const row = await readRow();
    expect(row).toMatchObject({
      fullName: null,
      contactEmail: null,
      githubUrl: null,
      siteName: null,
      siteUrl: null,
      quickLinks: [...DEFAULT_QUICK_LINK_KEYS],
    });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("site-settings", { expire: 0 });
  });

  it("treats a completely empty body as reset everything", async () => {
    await overrideEverything();

    const res = await reset();

    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(envSiteSettings());
  });

  it("rejects a malformed body with 400 instead of silently resetting everything", async () => {
    await overrideEverything();

    const res = await resetRoute(
      new Request("http://localhost/api/admin/settings/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{oops",
      }),
    );

    expect(res.status).toBe(400);
    expect((await readRow())?.fullName).toBe("Ada Lovelace");
  });

  it("clears only the given section and leaves the other groups intact", async () => {
    await overrideEverything();

    const res = await reset({ section: "profile" });

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.fullName).toBe(envSiteSettings().fullName);
    expect(data.githubUrl).toBe("https://github.com/ada");
    expect(data.siteName).toBe("ada.dev");
    expect(data.quickLinks).toEqual(["home"]);

    const row = await readRow();
    expect(row?.fullName).toBeNull();
    expect(row?.githubUrl).toBe("https://github.com/ada");
  });

  it("restores only the default nav when the quickLinks section is reset", async () => {
    await overrideEverything();

    const res = await reset({ section: "quickLinks" });

    expect(res.status).toBe(200);
    expect((await res.json()).data.quickLinks).toEqual([...DEFAULT_QUICK_LINK_KEYS]);
    expect((await readRow())?.fullName).toBe("Ada Lovelace");
  });

  it("rejects an unknown section with 400", async () => {
    await overrideEverything();

    const res = await reset({ section: "security" });

    expect(res.status).toBe(400);
    expect((await readRow())?.fullName).toBe("Ada Lovelace");
  });

  it("rejects an unauthenticated reset with 401", async () => {
    mockedRequire.mockRejectedValueOnce(new Error("Unauthorized"));

    const res = await reset({});

    expect(res.status).toBe(401);
  });
});
