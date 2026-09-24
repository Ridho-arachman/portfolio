import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(".env.e2e") });

import { defineConfig, devices } from "@playwright/test";

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const devWebServer = {
  command: `npm run dev -- -p ${PORT} --webpack`,
  url: BASE_URL,
  reuseExistingServer: false,
  timeout: 300_000,
  env: (() => {
    const env: Record<string, string> = { ...process.env } as Record<string, string>;
    env.NEXT_PUBLIC_BETTER_AUTH_URL = `http://localhost:${PORT}`;
    env.BETTER_AUTH_URL = `http://localhost:${PORT}`;
    env.DISABLE_RATE_LIMIT = "true";
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "";
    env.TURNSTILE_SECRET_KEY = "";
    return env;
  })(),
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 60_000 },
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
  webServer: devWebServer,
});
