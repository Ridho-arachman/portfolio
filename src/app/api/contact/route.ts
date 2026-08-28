// app/api/contact/route.ts
// Endpoint form kontak: validasi zod + CAPTCHA Turnstile + rate limit per IP
// lalu simpan pesan ke tabel Message.
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/utils/client-ip";
import { handleApiError } from "@/lib/prisma-errors";
import { contactApiSchema } from "@/schema/contact";

const CONTACT_RATE_LIMIT_MAX = 3;
const CONTACT_RATE_LIMIT_WINDOW_SECONDS = 60;

// Mencegah CSRF: request dari browser harus origin-nya sama dengan host.
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // klien non-browser / curl / test

  try {
    const originUrl = new URL(origin);
    return originUrl.host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const rate = await consumeRateLimit(
    `contact:${ip}`,
    CONTACT_RATE_LIMIT_MAX,
    CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      {
        status: 429,
        headers: { "X-Retry-After": String(rate.retryAfter ?? 60) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = contactApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const captchaValid = await verifyTurnstile(parsed.data.captchaToken);
  if (!captchaValid) {
    return NextResponse.json(
      { error: "CAPTCHA_VERIFICATION_FAILED" },
      { status: 400 },
    );
  }

  try {
    const { name, email, subject, content } = parsed.data;
    await prisma.message.create({ data: { name, email, subject, content } });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: handleApiError(error).status },
    );
  }

  return NextResponse.json({ success: true });
}
