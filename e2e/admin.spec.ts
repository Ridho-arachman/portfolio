import { expect, test } from "@playwright/test";

test("admin login page renders and signs in", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welcome Back",
  );

  await page.getByLabel("Email").fill("admin@ridho.dev");
  await page.getByLabel("Password", { exact: true }).fill("supersecret");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Login berhasil!")).toBeVisible();
  await expect(page.getByText("Kembali ke Beranda")).toBeVisible();
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

test("admin dashboard renders mockup stats and navigation", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(page.getByText("Welcome back, Ridho")).toBeVisible();
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
  await page.goto("/admin/projects");

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Projects");
  await expect(page.getByText(/mockup — data disimpan di localstorage/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Project" })).toBeVisible();
});

test("admin settings page renders profile form", async ({ page }) => {
  await page.goto("/admin/settings");

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Settings");
  await expect(page.getByLabel("Full Name")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save Changes" }).first(),
  ).toBeVisible();
});
