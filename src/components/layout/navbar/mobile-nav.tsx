"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "./constants";

export function MobileNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </m.button>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-bg-primary/95 backdrop-blur-2xl border-t border-glass-border overflow-hidden"
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
                          : "text-text-secondary hover:text-text-primary hover:bg-white/5",
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
