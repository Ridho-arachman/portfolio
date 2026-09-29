import { describe, expect, it } from "vitest";
import { getClientIp } from "@/utils/client-ip";

function headersWith(entries: Record<string, string>) {
  return new Headers(entries);
}

describe("getClientIp", () => {
  it("prefers the last valid x-forwarded-for entry (closest proxy)", () => {
    const headers = headersWith({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18",
    });
    // Entri pertama mudah dipalsukan client; entri terakhir ditulis proxy tepercaya.
    expect(getClientIp(headers)).toBe("70.41.3.18");
  });

  it("trims whitespace and picks the last valid x-forwarded-for entry", () => {
    expect(getClientIp(headersWith({ "x-forwarded-for": " 198.51.100.2 , 10.0.0.1" }))).toBe(
      "10.0.0.1",
    );
  });

  it("skips invalid x-forwarded-for entries", () => {
    expect(getClientIp(headersWith({ "x-forwarded-for": "evil, 203.0.113.7" }))).toBe(
      "203.0.113.7",
    );
    expect(getClientIp(headersWith({ "x-forwarded-for": "evil" }))).toBe("unknown");
  });

  it("falls back to cf-connecting-ip", () => {
    expect(getClientIp(headersWith({ "cf-connecting-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9",
    );
  });

  it("falls back to x-real-ip before unknown", () => {
    expect(getClientIp(headersWith({ "x-real-ip": "192.0.2.5" }))).toBe("192.0.2.5");
  });

  it("returns 'unknown' when no relevant header exists", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
