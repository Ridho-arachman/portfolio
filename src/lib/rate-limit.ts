// lib/rate-limit.ts
// Rate limiter sederhana berbasis tabel `rateLimit` (Postgres), tanpa Redis.
// Key dibedakan dengan prefix agar tidak bentrok dengan rate limiter better-auth
// yang memakai key `{ip}|{path}`.
import prisma from "./prisma";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
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
