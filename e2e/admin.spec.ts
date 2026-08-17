import { expect, test, type Page } from "@playwright/test";
import {
  cleanupE2EUsers,
  E2E_ADMIN,
  E2E_USER,
  ensureAdminUser,
  ensureRegularUser,
  loginAsEmail,
} from "./helpers/admin-auth";

async function loginViaForm(page: Page) {
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.beforeAll(async ({ request }) => {
  await ensureAdminUser(request);
});

test.afterAll(async () => {
  await cleanupE2EUsers();
});

test("admin login page renders", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welcome Back",
  );
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

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Projects");
  await expect(
    page.getByText(/mockup — data disimpan di localstorage/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Project" })).toBeVisible();
});

test("admin settings page renders profile form", async ({ page }) => {
  await loginAsEmail(page, E2E_ADMIN.email);
  await page.goto("/admin/settings");

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Settings");
  await expect(page.getByLabel("Full Name")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save Changes" }).first(),
  ).toBeVisible();
});
