export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  id: '🇮🇩',
};

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/** Segmen 2-huruf yang tampak seperti locale tapi belum tentu valid (mis. `fr`). */
export function isLocaleLikeSegment(segment: string): boolean {
  return /^[a-zA-Z]{2}$/.test(segment);
}

export const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${NEXT_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  id: "id_ID",
};

/**
 * Murni (tanpa I/O): urutan resolusi locale untuk redirect —
 * cookie NEXT_LOCALE > tag pertama Accept-Language > DEFAULT_LOCALE.
 * Target utama unit test proxy — jangan baca request di sini.
 */
export function resolveRedirectLocale(options?: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  const cookieLocale = options?.cookieLocale?.trim();
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = options?.acceptLanguage;
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
    if (preferred && isValidLocale(preferred)) return preferred as Locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Murni (tanpa I/O): `/fr/about` -> `/en/about` (locale diputus via
 * resolveRedirectLocale). Kembalikan null bila tidak ada redirect invalid-locale.
 */
export function getInvalidLocaleRedirect(
  pathname: string,
  options?: { cookieLocale?: string | null; acceptLanguage?: string | null },
): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const first = segments[0];
  if (isValidLocale(first) || !isLocaleLikeSegment(first)) return null;
  const rest = `/${segments.slice(1).join("/")}`;
  const normalizedRest = rest === "/" ? "" : rest;
  return `/${resolveRedirectLocale(options)}${normalizedRest}`;
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  const firstSegment = segments[0];
  return isValidLocale(firstSegment) ? firstSegment : null;
}

export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;
  return pathname.replace(`/${locale}`, '') || '/';
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname);
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getAlternatePaths(pathname: string): Record<Locale, string> {
  const cleanPath = removeLocaleFromPath(pathname);
  const alternates: Partial<Record<Locale, string>> = {};
  
  for (const locale of LOCALES) {
    alternates[locale] = `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
  }
  
  return alternates as Record<Locale, string>;
}