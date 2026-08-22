import { expect, test, type Page } from "@playwright/test";
import {
  cleanupE2EUsers,
  E2E_ADMIN,
  ensureAdminUser,
  loginAsEmail,
} from "./helpers/admin-auth";

/**
 * Guard layout "pixel-perfect": tidak ada halaman yang boleh memicu
 * horizontal scroll (margin leak / overflow) pada breakpoint berapa pun.
 *
 * Dua lapis assertion:
 * 1. Dokumen: documentElement.scrollWidth <= clientWidth (+ toleransi subpixel).
 * 2. Pindaian elemen in-flow (bukan dekorasi pointer-events-none / fixed /
 *    absolute yang memang disengaja offscreen) untuk melaporkan pelaku.
 */

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/projects",
  "/experience",
  "/certificates",
  "/contact",
] as const;

const ADMIN_ROUTES = [
  "/admin",
  "/admin/projects",
  "/admin/experience",
  "/admin/certificates",
  "/admin/categories",
  "/admin/messages",
  "/admin/settings",
] as const;

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 640 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1536", width: 1536, height: 960 },
] as const;

interface OverflowSnapshot {
  docOverflow: number;
  offenders: string[];
}

async function snapshotOverflow(page: Page) {
  await page.waitForLoadState("networkidle");
  return page.evaluate<OverflowSnapshot>(() => {
    const doc = document.documentElement;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    const viewportWidth = window.innerWidth;
    const offenders: string[] = [];

    document.querySelectorAll("body *").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      // Layer dekoratif & posisi keluar-alur sengaja dikecualikan;
      // kebocoran nyata tetap tertangkap oleh cek dokumen di atas.
      if (style.pointerEvents === "none") return;
      if (style.position === "fixed" || style.position === "absolute") return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      if (rect.right > viewportWidth + 1 || rect.left < -1) {
        const cls = typeof el.className === "string" ? el.className : "";
        offenders.push(
          `${el.tagName.toLowerCase()}${cls ? `.${cls.split(" ").slice(0, 3).join(".")}` : ""} [left=${Math.round(rect.left)}, right=${Math.round(rect.right)}]`,
        );
      }
    });

    return { docOverflow, offenders };
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`layout tanpa overflow @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PUBLIC_ROUTES) {
      test(`public ${route} muat di viewport`, async ({ page }) => {
        await page.goto(route);
        const snap = await snapshotOverflow(page);
        expect(
          snap.docOverflow,
          `${route}: dokumen bocor ${snap.docOverflow}px. Pelaku: ${snap.offenders.join(" | ")}`,
        ).toBeLessThanOrEqual(1);
      });
    }

    test(`admin semua rute muat di viewport`, async ({ page, request }) => {
      await ensureAdminUser(request);
      await loginAsEmail(page, E2E_ADMIN.email);

      for (const route of ADMIN_ROUTES) {
        await page.goto(route);
        const snap = await snapshotOverflow(page);
        expect(
          snap.docOverflow,
          `${route}: dokumen bocor ${snap.docOverflow}px. Pelaku: ${snap.offenders.join(" | ")}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  });
}

test.describe("interaksi mobile nav @ 360px", () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test("dropdown mobile terbuka penuh-lebar di bawah header tanpa overflow", async ({
    page,
  }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await toggle.click();

    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();

    // Menu harus membentang selebar viewport dan menempel di bawah header 80px.
    const menuBox = await menu.boundingBox();
    if (!menuBox) throw new Error("Bounding box #mobile-menu tidak tersedia");
    expect(menuBox.x).toBe(0);
    expect(Math.abs(menuBox.width - 360)).toBeLessThanOrEqual(1);
    expect(Math.abs(menuBox.y - 80)).toBeLessThanOrEqual(2);

    // Membuka menu tidak boleh menciptakan horizontal scroll.
    const snap = await snapshotOverflow(page);
    expect(snap.docOverflow).toBeLessThanOrEqual(1);

    // Escape menutup menu.
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test.afterAll(async () => {
    await cleanupE2EUsers();
  });
});
