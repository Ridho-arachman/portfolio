"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./navbar-logo";
import { DesktopNav } from "./desktop-nav";
import { NavCollapseClient } from "./nav-collapse-client";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";
import { useTranslation } from "@/hooks/use-translation";
import { getLocaleFromPath, removeLocaleFromPath } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathLocale = getLocaleFromPath(pathname) || 'en';
  const cleanPath = removeLocaleFromPath(pathname);
  const isActiveContact = cleanPath === "/contact" || cleanPath.startsWith("/contact");

  return (
    <header
      role="banner"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 isolate transition-colors duration-300 animate-fade-in-down bg-bg-secondary",
        isScrolled && "border-b border-glass-border shadow-sm",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <NavbarLogo />

          {/* Desktop Navigation (pill menderet + satu nav link collapse) */}
          <DesktopNav />

          {/* Desktop: Language Switcher + CTA */}
          <div className="hidden lg:flex items-center gap-3 animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
            <LanguageSwitcher />
            <Link
              href={`/${pathLocale}/contact`}
              className={cn(
                "inline-flex items-center justify-center rounded-full font-medium text-sm px-6 py-3 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] min-w-[48px]",
                isActiveContact
                  ? "bg-accent text-bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:bg-accent-hover"
                  : "bg-text-primary text-bg-primary border border-text-primary hover:opacity-85",
              )}
            >
              {t.nav.letsTalk}
            </Link>
          </div>

          {/* Tablet & HP: hamburger menu */}
          <NavCollapseClient />
        </div>
      </div>

      {/* Theme toggle: floating FAB, selalu tersedia di semua viewport */}
      <ThemeToggleFloating />
    </header>
  );
}