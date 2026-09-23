export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  id: 'Indonesian',
};

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