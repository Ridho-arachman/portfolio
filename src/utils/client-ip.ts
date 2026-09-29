/**
 * Extract the client IP from proxy headers
 * (cf-connecting-ip, x-real-ip, x-forwarded-for).
 * Returns "unknown" when no header carries a valid address.
 */
// Header IP dapat dipalsukan client bila request langsung tanpa proxy tepercaya,
// jadi nilai ini hanya untuk rate-limit/analytics, bukan keputusan otorisasi.
function isValidIp(value: string): boolean {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split(".").every((p) => Number(p) <= 255);
  }
  if (value.includes(":") && /^[0-9a-fA-F:.]+$/.test(value)) {
    return value.split(":").length <= 8;
  }
  return false;
}

function firstValid(value: string | null): string | null {
  const v = value?.trim();
  return v && isValidIp(v) ? v : null;
}

export function getClientIp(headers: Headers): string {
  const cf = firstValid(headers.get("cf-connecting-ip"));
  if (cf) return cf;

  const real = firstValid(headers.get("x-real-ip"));
  if (real) return real;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const entries = forwarded.split(",").map((s) => s.trim());
    for (let i = entries.length - 1; i >= 0; i--) {
      if (isValidIp(entries[i])) return entries[i];
    }
  }

  return "unknown";
}
