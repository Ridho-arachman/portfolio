'use client';

import { useParams, usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, getLocaleFromPath, isValidLocale, type Locale } from '@/lib/i18n';

export function useLocale(): Locale {
  const params = useParams();
  const pathname = usePathname();

  const paramsLocale = params?.lang as string | undefined;
  if (paramsLocale && isValidLocale(paramsLocale)) return paramsLocale;

  const pathLocale = getLocaleFromPath(pathname ?? '');
  return pathLocale && isValidLocale(pathLocale) ? pathLocale : DEFAULT_LOCALE;
}
