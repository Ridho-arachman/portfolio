// lib/client-ip.ts
// Ekstraksi IP klien dari header proxy (x-forwarded-for, x-real-ip, cf-connecting-ip).
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
