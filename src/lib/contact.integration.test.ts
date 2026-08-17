// contact.integration.test.ts
// Menguji endpoint /api/contact: validasi, origin check, captcha, rate limit per IP,
// dan penyimpanan pesan ke tabel Message.
import { afterAll, describe, expect, it } from "vitest";
import prisma from "./prisma";
import { POST } from "@/app/api/contact/route";

type PostHandler = typeof POST;

function makeRequest(ip: string, body: object, origin?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": ip,
    host: "localhost:3000",
  };
  if (origin) headers.origin = origin;
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }) as unknown as Parameters<PostHandler>[0];
}

const validBody = {
  name: "Integration Tester",
  email: "contact-test@example.com",
  subject: "Project Inquiry",
  content: "This is a valid test message body.",
};

describe("contact endpoint", () => {
  afterAll(async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await prisma.message.deleteMany({ where: { email: validBody.email } });
    await prisma.$disconnect();
  });

  it("creates a message for a valid submission", async () => {
    const res = await POST(makeRequest("198.51.100.10", validBody));
    expect(res.status).toBe(200);

    const created = await prisma.message.findFirst({
      where: { email: validBody.email },
    });
    expect(created).not.toBeNull();
    expect(created?.subject).toBe(validBody.subject);
  });

  it("rejects a mismatched origin", async () => {
    const res = await POST(
      makeRequest("198.51.100.11", validBody, "https://evil.example"),
    );
    expect(res.status).toBe(403);
  });

  it("rejects missing captcha when a secret is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    try {
      const res = await POST(makeRequest("198.51.100.12", validBody));
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toMatchObject({
        error: "CAPTCHA_VERIFICATION_FAILED",
      });
    } finally {
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it("rate-limits submissions per IP", async () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 100)}`;
    for (let i = 0; i < 3; i++) {
      const res = await POST(makeRequest(ip, validBody));
      expect(res.status).toBe(200);
    }
    const blocked = await POST(makeRequest(ip, validBody));
    expect(blocked.status).toBe(429);
  });
});
