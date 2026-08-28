/**
 * Extract the client IP from proxy headers
 * (x-forwarded-for, cf-connecting-ip, x-real-ip).
 * Returns "unknown" when no header carries an address.
 */
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
