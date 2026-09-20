import type { APIRequestContext, Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/portfolio_test",
  })
});

const SERVER_ORIGIN =
  process.env.BETTER_AUTH_URL || "http://localhost:3005";

export const E2E_ADMIN = {
  email: "e2e-admin@ridho.dev",
  password: "e2e-admin-password-123",
  name: "E2E Admin",
};

export const E2E_USER = {
  email: "e2e-user@ridho.dev",
  password: "e2e-user-password-123",
  name: "E2E User",
};

function randomIp() {
  return `127.0.0.${Math.floor(Math.random() * 250) + 1}`;
}

// Pastikan user admin ada (via API sign-up untuk hash yang konsisten)
export async function ensureAdminUser(request: APIRequestContext) {
  // Hapus user lama jika ada
  await prisma.user.deleteMany({ where: { email: E2E_ADMIN.email } });

  // Sign up via API untuk hash password yang konsisten dengan better-auth
  const response = await request.post(`${SERVER_ORIGIN}/api/auth/sign-up/email`, {
    data: {
      email: E2E_ADMIN.email,
      password: E2E_ADMIN.password,
      name: E2E_ADMIN.name,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to create admin user: ${response.status()} ${body}`);
  }

  // Update role ke ADMIN (sign-up default USER)
  const user = await prisma.user.findUnique({ where: { email: E2E_ADMIN.email } });
  if (user && user.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
  }
}

// Pastikan user non-admin ada (tetap ber-role USER).
export async function ensureRegularUser(request: APIRequestContext) {
  // Hapus user lama jika ada
  await prisma.user.deleteMany({ where: { email: E2E_USER.email } });

  // Sign up via API untuk hash password yang konsisten dengan better-auth
  const response = await request.post(`${SERVER_ORIGIN}/api/auth/sign-up/email`, {
    data: {
      email: E2E_USER.email,
      password: E2E_USER.password,
      name: E2E_USER.name,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to create regular user: ${response.status()} ${body}`);
  }
}

// Login via browser form — cookie session otomatis ter-set di browser context.
// Untuk admin: tunggu sampai URL berpindah dari /admin/login (form submit + router.push).
// Untuk non-admin: redirect kembali ke /admin/login?error=forbidden, tunggu networkidle.
export async function loginAsEmail(page: Page, email: string) {
  const password =
    email === E2E_ADMIN.email ? E2E_ADMIN.password : E2E_USER.password;

  await page.goto("/admin/login");
  // Use specific selector for the email input in the login form (avoid mailto link)
  await page.locator('input[id="email"]').fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  // Tunggu form submit selesai: URL berpindah dari /admin/login,
  // atau (non-admin) kembali ke /admin/login dengan error param.
  await page.waitForURL(
    (url) =>
      !url.pathname.endsWith("/admin/login") ||
      url.searchParams.has("error"),
    { timeout: 30_000 },
  );
  // Tunggu navigasi/redirect berikutnya selesai (network idle).
  await page.waitForLoadState("networkidle", { timeout: 10_000 });
}

export async function cleanupE2EUsers() {
  await prisma.user.deleteMany({
    where: { email: { in: [E2E_ADMIN.email, E2E_USER.email] } },
  });
}

const SEED_VISITS = [
  {
    path: "/",
    country: "Indonesia",
    countryCode: "id",
    region: "Southeast Asia",
    city: "Jakarta",
    lat: -6.2,
    lng: 106.845,
    sessionId: "e2e-seed-indonesia",
  },
  {
    path: "/",
    country: "United States",
    countryCode: "us",
    region: "Americas",
    city: "New York",
    lat: 40.71,
    lng: -74.01,
    sessionId: "e2e-seed-us",
  },
];

export async function seedVisits() {
  for (const visit of SEED_VISITS) {
    await prisma.visit.create({ data: visit });
  }
}

export async function cleanupVisits() {
  await prisma.visit.deleteMany({
    where: { sessionId: { in: SEED_VISITS.map((v) => v.sessionId) } },
  });
}

