"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { getLocaleFromPath, addLocaleToPath } from "@/lib/i18n";
import { usePathname } from "next/navigation";

const QUICK_LINK_KEYS = ['home', 'about', 'projects', 'experience', 'certificates', 'contact'] as const;
type QuickLinkKey = (typeof QUICK_LINK_KEYS)[number];

const QUICK_LINK_PATHS: Record<QuickLinkKey, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  experience: '/experience',
  certificates: '/certificates',
  contact: '/contact',
};

export function FooterLinks() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const pathLocale = getLocaleFromPath(pathname) || 'en';

  const buildHref = (path: string) => addLocaleToPath(path, pathLocale);

  return (
    <div className="animate-fade-in-up delay-100">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        {t.footer.quickLinks}
      </h3>
      <ul className="space-y-3">
        {QUICK_LINK_KEYS.map((key, idx) => {
          const path = QUICK_LINK_PATHS[key];
          return (
            <li key={path} className="animate-fade-in-up" style={{ animationDelay: `${200 + idx * 80}ms` }}>
              <Link
                href={buildHref(path)}
                className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                {t.nav[key as keyof typeof t.nav]}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}