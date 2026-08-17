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
  webServer: {
    command: `docker compose -f docker/docker-compose.test.yml up -d && npx prisma generate && npx prisma db push && npm run build && npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 480_000,
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/portfolio_test",
      // Matikan rate limit agar banyaknya percobaan login/sign-up di E2E
      // tidak memicu 429. Captcha tetap diuji lewat unit & integration test.
      DISABLE_RATE_LIMIT: "true",
      // Isolasi dari .env asli: captcha nonaktif & widget tak dirender,
      // karena Playwright tidak bisa menyelesaikan CAPTCHA Turnstile.
      TURNSTILE_SECRET_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      NEXT_PUBLIC_BETTER_AUTH_URL: `http://localhost:${PORT}`,
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      BETTER_AUTH_SECRET: "ci-e2e-test-secret-1234567890abcdef",
    },
  },
});
