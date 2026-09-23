"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { getLocaleFromPath, removeLocaleFromPath } from "@/lib/i18n";
import { NAV_LINK_PATHS, type NavLinkKey } from "./constants";

// Link yang konteksnya sama (bukti karier) digabung jadi satu nav link yang bisa collapse
const COLLAPSE_KEYS: readonly NavLinkKey[] = ["projects", "experience", "certificates"];
// Link utama yang tetap menderet sebagai pill langsung
const INLINE_KEYS: readonly NavLinkKey[] = ["home", "about", "contact"];

export function DesktopNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const panelRef = useRef<HTMLDivElement>(null);

  // Get locale from pathname since this component is outside [lang] segment
  const pathLocale = getLocaleFromPath(pathname) || 'en';
  const cleanPath = removeLocaleFromPath(pathname);

  // Tutup menu saat rute berubah
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Tutup menu saat klik di luar panel
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    const targetPath = path === '/' ? '/' : path;
    return cleanPath === targetPath || cleanPath.startsWith(targetPath + '/');
  };

  const buildHref = (path: string) => `/${pathLocale}${path}`;

  const groupActive = COLLAPSE_KEYS.some((key) => isActive(NAV_LINK_PATHS[key]));

  const linkStyle = {
    // Force minimum touch target and explicit contrast
    minHeight: "56px",
    minWidth: "56px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  };

  return (
    <nav aria-label="Main navigation" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {INLINE_KEYS.map((key, index) => {
          const path = NAV_LINK_PATHS[key];
          const active = isActive(path);
          return (
            <li
              key={path}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link
                href={buildHref(path)}
                className={cn(
                  "relative px-6 py-4 rounded-full text-sm font-medium transition-colors duration-300 min-h-[56px] min-w-[56px] flex items-center justify-center",
                  active
                    ? "bg-accent/10"
                    : "hover:bg-accent/5",
                )}
                style={linkStyle}
              >
                {t.nav[key]}

                {active && (
                  <span className="absolute inset-0 rounded-full bg-accent-muted -z-10 animate-slide-in" />
                )}
              </Link>
            </li>
          );
        })}

        {/* Satu nav link yang bisa collapse (pola NavigationMenu) */}
        <li
          className="relative animate-fade-in-up"
          style={{ animationDelay: `${INLINE_KEYS.length * 100}ms` }}
        >
          <div ref={panelRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "relative px-6 py-4 rounded-full text-sm font-medium transition-colors duration-300 min-h-[56px] min-w-[56px] flex items-center justify-center gap-2",
                isMenuOpen || groupActive
                  ? "bg-accent/10"
                  : "hover:bg-accent/5",
              )}
              style={linkStyle}
              aria-expanded={isMenuOpen}
              aria-controls="desktop-nav-menu"
              data-testid="desktop-nav-toggle"
            >
              {t.nav.menu}
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-300",
                  isMenuOpen && "rotate-180",
                )}
              />
            </button>

            {isMenuOpen && (
              <div
                id="desktop-nav-menu"
                className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 z-50 animate-slide-down"
              >
                <ul className="bg-bg-secondary border border-glass-border rounded-xl shadow-lg overflow-hidden py-2">
                  {COLLAPSE_KEYS.map((key) => {
                    const path = NAV_LINK_PATHS[key];
                    const active = isActive(path);
                    return (
                      <li key={path}>
                        <Link
                          href={buildHref(path)}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "block px-4 py-4 text-sm font-medium transition-colors duration-200 min-h-[56px] min-w-[56px] flex items-center",
                            active
                              ? "bg-accent/10"
                              : "hover:bg-accent/5",
                          )}
                          style={{ textDecoration: "none" }}
                        >
                          {t.nav[key]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
}