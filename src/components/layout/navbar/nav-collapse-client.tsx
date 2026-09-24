"use client";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { getLocaleFromPath, removeLocaleFromPath } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { CVDownload } from "./cv-download";

const NAV_LINK_KEYS = ['home', 'about', 'projects', 'experience', 'certificates', 'contact'] as const;
type NavLinkKey = (typeof NAV_LINK_KEYS)[number];

const NAV_LINK_PATHS: Record<NavLinkKey, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  experience: '/experience',
  certificates: '/certificates',
  contact: '/contact',
};

export function NavCollapseClient() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Get locale from pathname since this component is outside [lang] segment
  const pathLocale = getLocaleFromPath(pathname) || 'en';
  const cleanPath = removeLocaleFromPath(pathname);

  // Tutup menu saat rute berubah
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    const targetPath = path === '/' ? '/' : path;
    return cleanPath === targetPath || cleanPath.startsWith(targetPath + '/');
  };

  const buildHref = (path: string) => `/${pathLocale}${path}`;

  return (
    <>
      {/* Collapse Menu Toggle - Mobile/Tablet (hamburger) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-3 text-text-primary hover:text-accent transition-colors rounded-lg hover:bg-accent-muted min-h-[48px] min-w-[48px] flex items-center justify-center"
        aria-label={t.nav.toggleMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="nav-menu"
        data-testid="mobile-nav-toggle"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Collapse Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="nav-menu"
          className="absolute inset-x-0 top-full bg-bg-secondary border-b border-glass-border shadow-lg overflow-hidden animate-slide-down"
        >
          <ul className="container mx-auto px-4 py-6 space-y-2">
            {NAV_LINK_KEYS.map((key, index) => {
              const path = NAV_LINK_PATHS[key];
              const active = isActive(path);
              return (
                <li key={path} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <Link
                    href={buildHref(path)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block py-4 px-4 rounded-xl text-sm font-medium transition-all duration-200 min-h-[56px] min-w-[56px] flex items-center",
                      active
                        ? "bg-accent/10"
                        : "hover:bg-accent/5",
                    )}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      minHeight: "56px",
                      minWidth: "56px",
                    }}
                  >
                    {t.nav[key as keyof typeof t.nav]}
                  </Link>
                </li>
              );
            })}

            <li className="pt-4 mt-2 border-t border-glass-border animate-fade-in-up delay-400">
              <CVDownload />
            </li>

            {/* Language Switcher in Mobile Menu */}
            <li className="pt-2 animate-fade-in-up delay-500">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}