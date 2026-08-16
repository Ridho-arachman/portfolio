import { expect, test } from "@playwright/test";

test.describe("visitor map", () => {
  test("renders the Leaflet map without side gaps", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });

    await expect(page.getByText("Visitors by Location")).toBeVisible();

    const map = page.locator(".leaflet-container");
    await expect(map).toBeVisible();

    await expect(page.locator(".leaflet-control-attribution")).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom out" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset zoom" })).toBeVisible();
  });

  test("map container fills its section width", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });

    const map = page.locator(".leaflet-container");
    await expect(map).toBeVisible();

    const section = page.locator(".visitor-leaflet").first();
    await expect(section).toBeVisible();

    const mapBox = await map.boundingBox();
    const sectionBox = await section.boundingBox();
    expect(mapBox).not.toBeNull();
    expect(sectionBox).not.toBeNull();

    if (mapBox && sectionBox) {
      expect(Math.abs(mapBox.width - sectionBox.width)).toBeLessThan(4);
    }
  });

  test("country names open when clicking a region card", async ({
    page,
  }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });

    const indonesia = page.getByRole("button", { name: /Indonesia/ });
    await expect(indonesia).toBeVisible();

    await indonesia.click();

    await expect(page.getByText("Cities · Indonesia")).toBeVisible();
  });
});
