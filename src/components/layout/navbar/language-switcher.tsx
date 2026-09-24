'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { LOCALES, LOCALE_FLAGS, LOCALE_NATIVE_NAMES, Locale, removeLocaleFromPath } from '@/lib/i18n';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale: currentLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const cleanPath = removeLocaleFromPath(pathname);
    const newPath = `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-full',
          'bg-glass-bg backdrop-blur-md border border-glass-border',
          'text-text-primary hover:text-accent transition-colors duration-200',
          'min-h-[44px] min-w-[44px]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="language-dropdown"
        data-testid="language-switcher-button"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline-flex items-center gap-1">
          {LOCALE_FLAGS[currentLocale]}
          <span className="text-sm font-medium">{LOCALE_NATIVE_NAMES[currentLocale]}</span>
        </span>
        <span className="sr-only">{currentLocale === 'en' ? 'English' : 'Bahasa Indonesia'}</span>
      </button>

      {isOpen && (
        <div
          id="language-dropdown"
          aria-label="Select language"
          className={cn(
            'absolute right-0 top-full mt-2 w-40',
            'bg-bg-secondary border border-glass-border rounded-xl',
            'shadow-lg overflow-hidden animate-slide-down',
            'z-50'
          )}
        >
          <ul className="py-1">
            {LOCALES.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => handleLocaleChange(locale)}
                  role="option"
                  aria-selected={locale === currentLocale}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'text-text-primary hover:bg-accent/10 transition-colors',
                    'text-left focus:outline-none focus:bg-accent/10',
                    locale === currentLocale && 'bg-accent/10 text-accent'
                  )}
                  data-testid={`language-option-${locale}`}
                >
                  <span className="text-base" aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
                  <span className="font-medium">{LOCALE_NATIVE_NAMES[locale]}</span>
                  {locale === currentLocale && (
                    <span className="ml-auto text-accent" aria-hidden="true">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}