import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES: Array<[path: string, heading: string]> = [
  ["/", "Future"],
  ["/about", "About"],
  ["/projects", "Projects"],
  ["/experience", "Experiences"],
  ["/certificates", "Certificates"],
  ["/contact", "Together"],
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
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Future");
  await expect(page.getByText("Available for hire", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact Me" })).toBeVisible();
});

test("contact navigation link points to the contact page", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Contact Me" }).click();

  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    "Together",
  );
});
