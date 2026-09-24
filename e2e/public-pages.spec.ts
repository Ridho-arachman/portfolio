import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES: Array<[path: string, heading: string]> = [
  ["/en", "Ridho Arachman"],
  ["/en/about", "About"],
  ["/en/projects", "Projects"],
  ["/en/experience", "Experiences"],
  ["/en/certificates", "Certificates"],
  ["/en/contact", "Have a project in mind?"],
];

for (const [path, heading] of PUBLIC_ROUTES) {
  test(`${path} renders successfully`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    const pageHeading = page.locator("h1, h2").first();
    await expect(pageHeading).toBeVisible();
    await expect(pageHeading).toContainText(heading);
  });
}

test("home page shows hero call to action", async ({ page }) => {
  await page.goto("/en");

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Ridho Arachman");
  await expect(page.getByText("Available for hire", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View Projects" }),
  ).toBeVisible();
});

test("contact navigation link keeps the active locale", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");

  await page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Contact" })
    .click();

  await page.waitForURL(/\/en\/contact$/, { timeout: 60_000 });
  await expect(
    page.getByRole("heading", { name: "Have a project in mind?" }),
  ).toBeVisible();
});

test("root redirects to the browser locale", async ({ page }) => {
  const response = await page.goto("/");

  expect(["/en", "/id"]).toContain(new URL(page.url()).pathname.replace(/\/$/, ""));
  expect(response?.status()).toBe(200);
});

test("language switcher navigates between locales", async ({ page }) => {
  await page.goto("/en");

  await page.getByTestId("language-switcher-button").click();
  await page.getByTestId("language-option-id").click();

  await expect(page).toHaveURL(/\/id(\/|$)/);
});
