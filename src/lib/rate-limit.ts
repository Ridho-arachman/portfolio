// lib/rate-limit.ts
// Unified rate limiter berbasis tabel `rateLimit` (Postgres), tanpa Redis.
// Digunakan untuk non-auth endpoints (contact, upload, search, dll).
// Auth endpoints (sign-in, sign-up) ditangani oleh better-auth built-in.
import prisma from "./prisma";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export interface RateLimitConfig {
  key: string;
  max: number;
  windowSeconds: number;
}

export async function consumeRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const row = await prisma.rateLimit.findUnique({ where: { key } });

  if (!row) {
    await prisma.rateLimit.create({
      data: { key, count: 1, lastRequest: now },
    });
    return { allowed: true };
  }

  const lastRequest = Number(row.lastRequest);

  // Jendela sudah lewat -> reset hitungan.
  if (now - lastRequest > windowMs) {
    await prisma.rateLimit.update({
      where: { key },
      data: { count: 1, lastRequest: now },
    });
    return { allowed: true };
  }

  if (row.count >= max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((lastRequest + windowMs - now) / 1000),
    };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 }, lastRequest: now },
  });
  return { allowed: true };
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

export async function applyRateLimit(
  preset: keyof typeof rateLimitPresets,
  arg1: string,
  arg2?: string
) {
  const config = rateLimitPresets[preset](arg1, arg2 as any);
  const result = await consumeRateLimit(config.key, config.max, config.windowSeconds);
  return {
    ...result,
    headers: {
      "X-RateLimit-Limit": String(config.max),
      "X-RateLimit-Remaining": String(result.allowed ? config.max - 1 : 0),
      "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + (result.retryAfter ?? config.windowSeconds)),
      ...(result.retryAfter ? { "X-Retry-After": String(result.retryAfter) } : {}),
    },
  };
}
