// lib/rate-limit.ts
// Unified rate limiter berbasis tabel `rateLimit` (Postgres), tanpa Redis.
// Digunakan untuk non-auth endpoints (contact, upload, search, dll).
// Auth endpoints (sign-in, sign-up) ditangani oleh better-auth built-in.
import prisma from "./prisma";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining: number;
}

export interface RateLimitConfig {
  key: string;
  max: number;
  windowSeconds: number;
}

/**
 * Check if rate limiting is globally disabled via env var.
 * Used in test environment and for emergency disable.
 */
function isRateLimitDisabled(): boolean {
  return (
    process.env.DISABLE_RATE_LIMIT === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

export async function consumeRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  if (isRateLimitDisabled()) {
    return { allowed: true, remaining: max };
  }
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  // Atomik: satu transaksi, increment bersyarat — tanpa findUnique-then-update.
  // upsert menutup balapan create; updateMany bersyarat menutup burst paralel.
  return prisma.$transaction(async (tx) => {
    await tx.rateLimit.upsert({
      where: { key },
      create: { key, count: 0, lastRequest: now },
      update: {},
    });

    // Jendela sudah lewat -> reset hitungan.
    const reset = await tx.rateLimit.updateMany({
      where: { key, lastRequest: { lte: windowStart } },
      data: { count: 1, lastRequest: now },
    });
    if (reset.count === 1) {
      return { allowed: true, remaining: Math.max(0, max - 1) };
    }

    // Dalam jendela: tambah hanya bila masih di bawah max.
    const incremented = await tx.rateLimit.updateMany({
      where: { key, count: { lt: max } },
      data: { count: { increment: 1 }, lastRequest: now },
    });
    if (incremented.count === 1) {
      const row = await tx.rateLimit.findUnique({ where: { key } });
      const count = row?.count ?? 1;
      return { allowed: true, remaining: Math.max(0, max - count) };
    }

    const row = await tx.rateLimit.findUnique({ where: { key } });
    const lastRequest = Number(row?.lastRequest ?? now);
    return {
      allowed: false,
      retryAfter: Math.max(
        0,
        Math.ceil((lastRequest + windowMs - now) / 1000),
      ),
      remaining: 0,
    };
  });
}

/**
 * Preset configurations untuk endpoint umum.
 * Tambahkan preset baru di sini agar konsisten.
 */
export const rateLimitPresets = {
  /** Contact form: 3 req / menit per IP */
  contact: (ip: string) => ({
    key: `contact:${ip}`,
    max: 3,
    windowSeconds: 60,
  }),

  /** File upload: 5 req / menit per IP */
  upload: (ip: string) => ({
    key: `upload:${ip}`,
    max: 5,
    windowSeconds: 60,
  }),

  /** Search API: 30 req / menit per IP */
  search: (ip: string) => ({
    key: `search:${ip}`,
    max: 30,
    windowSeconds: 60,
  }),

  /** Generic API: 60 req / menit per IP */
  api: (ip: string) => ({
    key: `api:${ip}`,
    max: 60,
    windowSeconds: 60,
  }),

  /** Per-user action (mis. create/update/delete): 10 req / menit per userId */
  userAction: (userId: string, action: string) => ({
    key: `user:${action}:${userId}`,
    max: 10,
    windowSeconds: 60,
  }),
} as const;

type PresetParams =
  | [preset: "contact" | "upload" | "search" | "api", ip: string]
  | [preset: "userAction", userId: string, action: string];

export async function applyRateLimit(...args: PresetParams) {
  const [preset, arg1, arg2] = args;
  const config = rateLimitPresets[preset](arg1, arg2 as string);
  const result = await consumeRateLimit(config.key, config.max, config.windowSeconds);
  return {
    ...result,
    headers: {
      "X-RateLimit-Limit": String(config.max),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + (result.retryAfter ?? config.windowSeconds)),
      ...(result.retryAfter ? { "X-Retry-After": String(result.retryAfter) } : {}),
    },
  };
}
