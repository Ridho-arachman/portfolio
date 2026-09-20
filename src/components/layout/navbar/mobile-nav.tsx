"use client";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "./constants";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";

export function MobileNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Tutup menu saat rute berubah (mis. navigasi via back/forward) -
  // pola "adjust state during render" yang direkomendasikan React.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Tutup menu dengan tombol Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-accent-muted"
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        data-testid="mobile-nav-toggle"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute inset-x-0 top-full bg-bg-primary/95 backdrop-blur-2xl border-b border-glass-border shadow-lg overflow-hidden animate-slide-down"
        >
          <ul className="container mx-auto px-4 py-6 space-y-2">
            {NAV_LINKS.map((link, index) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "text-accent bg-accent-muted"
                        : "text-text-secondary hover:text-text-primary hover:bg-glass-hover",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li className="pt-4 mt-2 border-t border-glass-border animate-fade-in-up delay-400">
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "inline-flex w-full items-center justify-center py-3 px-4 rounded-full font-medium text-sm transition-all duration-300",
                  isActive("/contact")
                    ? "bg-accent text-bg-primary border-accent"
                    : "bg-accent-muted border border-accent/50 text-accent hover:bg-accent/20",
                )}
              >
                Let&apos;s Talk
              </Link>
            </li>

            {/* Theme Toggle in Mobile Menu */}
            <li className="pt-2 animate-fade-in-up delay-500">
              <ThemeToggleFloating />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
