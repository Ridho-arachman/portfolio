'use client';

import { cn } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useRef, useEffect } from 'react';
import { getLocaleFromPath, Locale } from '@/lib/i18n';

export function CVDownload() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const pathLocale = getLocaleFromPath(pathname) || 'en';

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

  const handleDownload = (locale: Locale) => {
    const cvPath = `/cv-${locale}.pdf`;
    const link = document.createElement('a');
    link.href = cvPath;
    link.download = `Ridho-Arachman-CV-${locale === 'en' ? 'EN' : 'ID'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-medium text-sm px-6 py-3',
          'transition-all duration-300 hover:scale-105 active:scale-95',
          'min-h-[48px] min-w-[48px]',
          'bg-accent text-bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:bg-accent-hover',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
        aria-label={t.nav.downloadCV}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="cv-dropdown"
        data-testid="cv-download-button"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        <span>{t.nav.downloadCV}</span>
      </button>

      {isOpen && (
        <div
          id="cv-dropdown"
          role="listbox"
          aria-label={t.nav.selectCVLanguage}
          className={cn(
            'absolute right-0 top-full mt-2 w-48',
            'bg-bg-secondary border border-glass-border rounded-xl',
            'shadow-lg overflow-hidden animate-slide-down',
            'z-50'
          )}
        >
          <ul role="listbox" className="py-1">
            {(['en', 'id'] as Locale[]).map((locale) => (
              <li key={locale} role="option">
                <button
                  onClick={() => handleDownload(locale)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'text-text-primary hover:bg-accent/10 transition-colors',
                    'text-left focus:outline-none focus:bg-accent/10'
                  )}
                  data-testid={`cv-option-${locale}`}
                >
                  <FileText className="w-4 h-4 text-accent" aria-hidden="true" />
                  <span className="font-medium">
                    {locale === 'en' ? t.nav.cvEnglish : t.nav.cvIndonesian}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}