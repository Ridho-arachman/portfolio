"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { getLocaleFromPath, removeLocaleFromPath, addLocaleToPath } from "@/lib/i18n";
import { isQuickLinkKey, QUICK_LINK_PATHS } from "@/lib/quick-links";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/components/providers/public-content-provider";
import { cn } from "@/lib/utils";

export function FooterLinks() {
  const { t } = useTranslation();
  const { quickLinks } = useSiteSettings();
  const pathname = usePathname();
  const pathLocale = getLocaleFromPath(pathname) || 'en';
  const cleanPath = removeLocaleFromPath(pathname);

  const buildHref = (path: string) => addLocaleToPath(path, pathLocale);

  const isActive = (path: string) => {
    if (path === '/') return cleanPath === '/';
    return cleanPath === path || cleanPath.startsWith(`${path}/`);
  };

  return (
    <div className="animate-fade-in-up delay-100">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        {t.footer.quickLinks}
      </h3>
      <ul className="space-y-3">
        {/* `quickLinks` menentukan isi DAN urutan. Key yang tidak dikenal ikut
            dilewati: isQuickLinkKey menolak key di luar enam nav key, filter
            kedua menolak key yang belum punya label di katalog pesan. */}
        {quickLinks
          .filter(isQuickLinkKey)
          .filter((key) => key in t.nav)
          .map((key, idx) => {
          const path = QUICK_LINK_PATHS[key];
          const active = isActive(path);
          return (
            <li key={key} className="animate-fade-in-up" style={{ animationDelay: `${200 + idx * 80}ms` }}>
              <Link
                href={buildHref(path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-colors text-sm flex items-center gap-2 group",
                  active ? "text-accent font-medium" : "text-text-secondary hover:text-accent",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    active ? "bg-accent" : "bg-accent/0 group-hover:bg-accent",
                  )}
                />
                {t.nav[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
