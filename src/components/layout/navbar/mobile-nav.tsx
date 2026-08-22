"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "./constants";

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
      <m.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-accent-muted"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </m.button>

      {/* Mobile Menu Dropdown
          Absolut terhadap header (fixed) sehingga selalu membentang penuh
          TEPAT di bawah navbar — bukan anak flex row yang merusak layout. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden absolute inset-x-0 top-full bg-bg-primary/95 backdrop-blur-2xl border-b border-glass-border shadow-lg overflow-hidden"
          >
            <ul className="container mx-auto px-4 py-6 space-y-2">
              {NAV_LINKS.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <m.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
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
                  </m.li>
                );
              })}

              <m.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4 mt-2 border-t border-glass-border"
              >
                <Button
                  className={cn(
                    "w-full rounded-full font-medium text-sm transition-all duration-300",
                    isActive("/contact")
                      ? "bg-accent text-bg-primary border-accent"
                      : "bg-accent-muted border border-accent/50 text-accent hover:bg-accent/20",
                  )}
                >
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Let&apos;s Talk
                  </Link>
                </Button>
              </m.li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
