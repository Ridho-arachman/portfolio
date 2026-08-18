import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(".env.e2e") });

import { defineConfig, devices } from "@playwright/test";

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: `npx prisma generate && npx prisma db push && npm run build && npx next start -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 480_000,
        env: {
          ...process.env,
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://postgres:postgres@localhost:5432/portfolio_test",
          DISABLE_RATE_LIMIT: "true",
          TURNSTILE_SECRET_KEY: "",
          NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
          NEXT_PUBLIC_BETTER_AUTH_URL: `http://localhost:${PORT}`,
          BETTER_AUTH_URL: `http://localhost:${PORT}`,
          BETTER_AUTH_SECRET: "ci-e2e-test-secret-1234567890abcdef",
        },
      }
    : {
        command: `docker compose -f docker/docker-compose.test.yml up -d && npx prisma generate && npx prisma db push && npm run build && npx next start -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 480_000,
        env: {
          ...process.env,
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://postgres:postgres@localhost:5432/portfolio_test",
          DISABLE_RATE_LIMIT: "true",
          TURNSTILE_SECRET_KEY: "",
          NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
          NEXT_PUBLIC_BETTER_AUTH_URL: `http://localhost:${PORT}`,
          BETTER_AUTH_URL: `http://localhost:${PORT}`,
          BETTER_AUTH_SECRET: "ci-e2e-test-secret-1234567890abcdef",
        },
      },
});
