export type HeroBackgroundProps = Record<string, never>;

/**
 * Marquee ini menggantikan slot "Trusted by <wordmark>" di desain referensi:
 * daftar perusahaan fiktif akan jadi social proof palsu, jadi yang
 * ditampilkaninstead stack yang benar-benar dipakai repo ini.
 */
export const TECH_STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Prisma",
  "Tailwind CSS",
  "Motion",
  "PostgreSQL",
  "GSAP",
  "Vitest",
  "Playwright",
] as const;