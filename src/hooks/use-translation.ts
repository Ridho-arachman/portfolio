'use client';

import { useParams, usePathname } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { Locale, LOCALES, DEFAULT_LOCALE, isValidLocale, getLocaleFromPath } from '@/lib/i18n';
import { getMessagesSync, type Messages } from '@/lib/translations-client';

function getLocaleFromPathname(pathname: string): Locale {
  const locale = getLocaleFromPath(pathname);
  return locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function useTranslation(): { t: Messages; locale: Locale } {
  const params = useParams();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // For components inside [lang] segment, useParams() works
  // For components outside (like navbar in root layout), use pathname
  const paramsLocale = params?.lang as Locale | undefined;
  const effectiveLocale = paramsLocale && isValidLocale(paramsLocale) 
    ? paramsLocale 
    : getLocaleFromPathname(pathname || '');

  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use effectiveLocale derived from URL - works for both SSR and client
  const locale = effectiveLocale || DEFAULT_LOCALE;

  const t = useMemo(() => getMessagesSync(locale), [locale]);

  return { t, locale };
}

export function useTranslationNamespace<K extends keyof Messages>(
  namespace: K
): { t: Messages[K]; locale: Locale } {
  const { t, locale } = useTranslation();
  return { t: t[namespace], locale };
}