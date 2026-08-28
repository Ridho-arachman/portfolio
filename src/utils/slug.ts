/**
 * Convert arbitrary text into a URL-friendly slug.
 * Lowercase, strip non-alphanumerics to single hyphens, trim edge hyphens.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
