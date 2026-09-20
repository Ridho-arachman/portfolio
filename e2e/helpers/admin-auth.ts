import type { APIRequestContext, Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";
import { randomUUID } from "crypto";

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

// Pastikan user admin ada (langsung create di DB, bypass CAPTCHA)
export async function ensureAdminUser(request: APIRequestContext) {
  const existing = await prisma.user.findUnique({
    where: { email: E2E_ADMIN.email },
  });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
      });
    }
    // Ensure account exists with password
    const existingAccount = await prisma.account.findUnique({
      where: { providerId_accountId: { providerId: "credential", accountId: E2E_ADMIN.email } },
    });
    if (!existingAccount) {
const hashedPassword = await hash(E2E_ADMIN.password, 10);
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: E2E_ADMIN.email,
          providerId: "credential",
          userId: existing.id,
          password: hashedPassword,
        },
      });
    }
    return;
  }

  // Create user directly in DB (bypass CAPTCHA) - hash password with bcrypt
  const hashedPassword = await hash(E2E_ADMIN.password, 10);

  const user = await prisma.user.create({
    data: {
      email: E2E_ADMIN.email,
      name: E2E_ADMIN.name,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  // Create account with password for credentials provider
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: E2E_ADMIN.email,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    },
  });
}

// Pastikan user non-admin ada (tetap ber-role USER).
export async function ensureRegularUser(request: APIRequestContext) {
  const existing = await prisma.user.findUnique({
    where: { email: E2E_USER.email },
  });
  if (existing) {
    // Ensure account exists
    const existingAccount = await prisma.account.findUnique({
      where: { providerId_accountId: { providerId: "credential", accountId: E2E_USER.email } },
    });
if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: E2E_USER.email,
          providerId: "credential",
          userId: existing.id,
          password: await hash(E2E_USER.password, 10),
        },
      });
    }
    return;
  }

  const hashedPassword = await hash(E2E_USER.password, 10);

  const user = await prisma.user.create({
    data: {
      email: E2E_USER.email,
      name: E2E_USER.name,
      role: "USER",
      emailVerified: true,
    },
  });

  // Create account with password for credentials provider
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: E2E_USER.email,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    },
  });
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
  // Tunggu form submit selesai: URL berubah dari /admin/login,
  // atau (non-admin) kembali ke /admin/login dengan error param.
  await page.waitForURL(
    (url) =>
      !url.pathname.endsWith("/admin/login") ||
      url.searchParams.has("error"),
    { timeout: 15_000 },
  );
  // Tunggu navigasi/redirect berikutnya selesai (network idle).
  await page.waitForLoadState("networkidle");
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

