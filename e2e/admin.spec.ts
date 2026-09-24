import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import {
  cleanupE2EUsers,
  E2E_ADMIN,
  E2E_USER,
  ensureRegularUser,
  loginAsEmail,
  promoteE2EAdmin,
} from "./helpers/admin-auth";

async function loginViaForm(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[id="email"]').fill(E2E_ADMIN.email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin$/, { timeout: 90_000 });
}

// Seed ulang user admin sebelum test yang butuh login sesi. Dipakai per-test
// (bukan beforeAll) karena Playwright beforeAll tidak punya request fixture.
async function seedAdminViaApi(request: APIRequestContext) {
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3005";
  await request.post(`${origin}/api/auth/sign-up/email`, {
    headers: { origin },
    data: {
      email: E2E_ADMIN.email,
      password: E2E_ADMIN.password,
      name: E2E_ADMIN.name,
    },
  });
  await promoteE2EAdmin();
}

test.beforeEach(async ({ request }) => {
  await seedAdminViaApi(request);
});

test.afterAll(async () => {
  await cleanupE2EUsers();
});

test("admin login page renders", async ({ page }) => {
  await page.goto("/admin/login");

  // Wait for login form to be visible (motion animation may hide heading in headless CI)
  await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('input[id="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

test("admin login offers a back link and a theme toggle", async ({ page }) => {
  await page.goto("/admin/login");

  const back = page.getByRole("link", { name: "Back" }).first();
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("href", "/");

  await expect(
    page.getByRole("button", { name: "Toggle theme" }),
  ).toBeVisible();
});

test("admin login validates credentials", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(
    page.getByText("Please enter a valid email address"),
  ).toBeVisible();
  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible();
});

test("unauthenticated access to /admin redirects to login", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login/);
});

test("signs in via the form and lands on the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await loginViaForm(page);

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("Total Projects")).toBeVisible();
});

test("non-admin role is blocked from /admin", async ({ page, request }) => {
  await ensureRegularUser(request);
  await loginAsEmail(page, E2E_USER.email);

  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Akun tidak memiliki akses admin.")).toBeVisible();
});

test("admin dashboard renders mockup stats and navigation", async ({
  page,
}) => {
  await loginAsEmail(page, E2E_ADMIN.email);

  await expect(page.getByText("Total Projects")).toBeVisible();
  await expect(page.getByText("Total visits (30d)").first()).toBeVisible();

  for (const label of [
    "Dashboard",
    "Projects",
    "Experience",
    "Certificates",
    "Messages",
    "Settings",
  ]) {
    await expect(
      page.getByRole("link", { name: label, exact: true }).first(),
    ).toBeVisible();
  }
});

test("admin projects page manages seed data", async ({ page }) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  await page.goto("/admin/projects");

  // Wait for the Projects heading to be visible (handles loading states)
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toContainText("Projects", { timeout: 30_000 });
  await expect(page.getByRole("link", { name: "Add Project" })).toBeVisible();
});

test("admin settings page renders profile form", async ({ page }) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  await page.goto("/admin/settings");

  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" }),
  ).toContainText("Settings");
  await expect(page.getByLabel("Full Name")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save Changes" }).first(),
  ).toBeVisible();
});
