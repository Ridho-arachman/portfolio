import { expect, test } from "@playwright/test";

// `/en/about` sengaja tidak ada di sini: halaman itu tidak punya h1/h2 di
// dalam <main>, jadi `h1, h2` pertama yang diassert justru heading milik
// chrome. `/en` memakai "Developer" karena h1 hero berisi judul yang bisa
// ditimpa site settings, dan nilainya berbeda antara production dan E2E.
const PUBLIC_ROUTES: Array<[path: string, heading: string]> = [
  ["/en", "Developer"],
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

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Developer",
  );
  await expect(page.getByText("Available for hire", { exact: true })).toBeVisible();
  // `.first()` karena ada dua link "View Projects": CTA hero dan section showcase.
  await expect(
    page.getByRole("link", { name: "View Projects" }).first(),
  ).toBeVisible();
});

test("/en/about renders its main content", async ({ page }) => {
  const response = await page.goto("/en/about");
  expect(response?.status()).toBe(200);

  await expect(
    page.locator("main").getByRole("heading").first(),
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
