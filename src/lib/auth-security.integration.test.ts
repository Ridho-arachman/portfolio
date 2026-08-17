// auth-security.integration.test.ts
// Menguji: rate limiting berbasis database, verifikasi captcha Turnstile,
// dan kolom role (default USER, bisa diubah ADMIN).
import { afterAll, describe, expect, it, vi } from "vitest";
import prisma from "./prisma";

const unique = Date.now();
const TEST_EMAIL = `security-${unique}@example.com`;
const TEST_PASSWORD = "security-password";
const BASE = "http://localhost:3000/api/auth";

// Muat ulang modul auth agar env terbaru (DISABLE_RATE_LIMIT, TURNSTILE...) terbaca.
async function loadAuth() {
  vi.resetModules();
  const mod = await import("./auth");
  return mod.auth;
}

// Panggil endpoint sign-in lewat HTTP handler (jalur produksi, rate limiter aktif di sini).
async function handlerSignIn(
  auth: Awaited<ReturnType<typeof loadAuth>>,
  headers: Record<string, string>,
  body: Record<string, unknown>,
) {
  return auth.handler(
    new Request(`${BASE}/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

// Panggil endpoint sign-up lewat HTTP handler (jalur produksi, captcha aktif).
async function handlerSignUp(
  auth: Awaited<ReturnType<typeof loadAuth>>,
  headers: Record<string, string>,
  body: Record<string, unknown>,
) {
  return auth.handler(
    new Request(`${BASE}/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

describe("auth security (rate limit, captcha, role)", () => {
  afterAll(async () => {
    process.env.DISABLE_RATE_LIMIT = "true";
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.AUTH_RATE_LIMIT_SIGNIN_MAX;
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
  });

  it("rate-limits repeated sign-in attempts per IP", async () => {
    process.env.DISABLE_RATE_LIMIT = "false";
    process.env.AUTH_RATE_LIMIT_SIGNIN_MAX = "2";
    const auth = await loadAuth();
    const headers = {
      "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 100)}`,
    };
    const body = { email: TEST_EMAIL, password: "wrong-password" };

    const first = await handlerSignIn(auth, headers, body);
    const second = await handlerSignIn(auth, headers, body);
    const third = await handlerSignIn(auth, headers, body);

    // 2 percobaan pertama tetap diproses (credential salah -> 401).
    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    // Percobaan ke-3 diblokir rate limiter.
    expect(third.status).toBe(429);

    process.env.DISABLE_RATE_LIMIT = "true";
    delete process.env.AUTH_RATE_LIMIT_SIGNIN_MAX;
  });

  it("rejects sign-in when turnstile token is missing/invalid", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    const auth = await loadAuth();
    const body = { email: TEST_EMAIL, password: "wrong-password" };

    const missing = await handlerSignIn(auth, {}, body);
    expect(missing.status).toBe(400);
    await expect(missing.json()).resolves.toMatchObject({
      error: "CAPTCHA_VERIFICATION_FAILED",
    });

    // Token valid (test key) -> captcha lolos, lanjut ke cek credential.
    const withToken = await handlerSignIn(auth, {}, { ...body, captchaToken: "test-token" });
    expect(withToken.status).toBe(401);

    delete process.env.TURNSTILE_SECRET_KEY;
  });

  it("signs up via the HTTP handler with a valid captcha token", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    const auth = await loadAuth();
    const email = `signup-http-${unique}@example.com`;
    const headers = {
      "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 100)}`,
    };

    try {
      const res = await handlerSignUp(
        auth,
        headers,
        {
          name: "HTTP Signup Tester",
          email,
          password: "http-signup-password",
          captchaToken: "dummy-turnstile-token",
        },
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as { user?: { role?: string } };
      expect(json.user?.role).toBe("USER");

      const created = await prisma.user.findUnique({ where: { email } });
      expect(created).not.toBeNull();
      expect(created?.role).toBe("USER");
    } finally {
      await prisma.user.deleteMany({ where: { email } });
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it("assigns default USER role and reflects ADMIN after update", async () => {
    const auth = await loadAuth();

    const { user } = await auth.api.signUpEmail({
      body: {
        name: "Security Tester",
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    });
    expect(user.role).toBe("USER");

    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    const sessionHeaders = new Headers();
    sessionHeaders.set("cookie", headers.getSetCookie()[0]);

    const session = await auth.api.getSession({ headers: sessionHeaders });
    expect(session?.user.role).toBe("USER");

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    const sessionAfterPromote = await auth.api.getSession({ headers: sessionHeaders });
    expect(sessionAfterPromote?.user.role).toBe("ADMIN");
  });
});
