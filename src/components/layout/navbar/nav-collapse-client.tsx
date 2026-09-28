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
          // Tinggi penuh dan `flex-col`: daftar nav yang bergulir, sementara
          // Unduh CV dan pemilih bahasa ditempel di kaki panel. Keduanya dulu
          // ikut tergulir, dan di viewport pendek — keyboard terbuka atau HP
          // landscape — isinya melebihi ruang yang tersedia, jadi pilihan bahasa
          // berakhir di bawah tepi dengan nol piksel terlihat dan tidak bisa
          // dipilih. Halaman di belakang tidak bisa menolong karena header `fixed`.
          className="absolute inset-x-0 top-full flex h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-bg-secondary border-b border-glass-border shadow-lg animate-slide-down"
        >
          <ul className="container mx-auto flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1">
            {NAV_LINK_KEYS.map((key, index) => {
              const path = NAV_LINK_PATHS[key];
              const active = isActive(path);
              return (
                <li key={path} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                  <Link
                    href={buildHref(path)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-[48px] items-center rounded-xl px-4 py-3 text-sm font-medium no-underline",
                      "transition-colors duration-200",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-text-primary hover:bg-accent/5 hover:text-accent",
                    )}
                  >
                    {t.nav[key as keyof typeof t.nav]}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* `shrink-0` + `pb` untuk safe area iPhone: kaki panel ini tidak pernah
              ikut bergulir, jadi Unduh CV dan pilihan bahasa selalu terjangkau. */}
          <div className="shrink-0 border-t border-glass-border bg-bg-secondary/95 backdrop-blur-xl">
            <div className="container mx-auto space-y-2 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <CVDownload />
              <LanguageSwitcher inline />
            </div>
          </div>
        </div>
      )}
    </>
  );
}