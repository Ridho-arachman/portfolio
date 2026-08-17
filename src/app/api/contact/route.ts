// app/api/contact/route.ts
// Endpoint form kontak: validasi zod + CAPTCHA Turnstile + rate limit per IP
// lalu simpan pesan ke tabel Message.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email("Please enter a valid email address"),
  subject: z.string().min(3).max(150),
  content: z.string().min(10).max(5000),
  captchaToken: z.string().optional(),
});

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

  const parsed = contactSchema.safeParse(body);
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

  const { name, email, subject, content } = parsed.data;
  await prisma.message.create({ data: { name, email, subject, content } });

  return NextResponse.json({ success: true });
}
