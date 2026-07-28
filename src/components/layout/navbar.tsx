"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import * as m from "motion/react-m"; // Tetap menggunakan 'm'
import Link from "next/link";
import { usePathname } from "next/navigation"; // Untuk mendeteksi halaman aktif
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname(); // Dapatkan URL saat ini
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper untuk mengecek apakah link sedang aktif
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <m.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? // FIX: Glass effect adaptif (Primary color dengan opacity 60% + blur maksimal + border variabel)
            "py-3 bg-bg-primary/60 backdrop-blur-2xl border-b border-glass-border shadow-sm"
          : "py-5 bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-lg group-hover:bg-accent/50 transition-all duration-500" />
                {/* Gunakan bg-gradient-to-br untuk mencegah hydration error */}
                <div className="relative w-10 h-10 rounded-lg bg-linear-to-br from-accent to-accent-hover flex items-center justify-center font-bold text-bg-primary">
                  R
                </div>
              </div>
              <span className="text-xl font-bold text-gradient-elegant">
                Ridho.dev
              </span>
            </Link>
          </m.div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const active = isActive(link.href);
              return (
                <m.li
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                      active
                        ? "text-accent"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {link.label}

                    {/* Animasi Sliding Pill untuk Active State */}
                    {active && (
                      <m.span
                        layoutId="active-nav-pill"
                        className="absolute inset-0 rounded-full bg-accent-muted -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                </m.li>
              );
            })}
          </ul>

          {/* CTA Button */}
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/contact"
              className={cn(
                "hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 font-medium text-sm",
                isActive("/contact")
                  ? "bg-accent text-bg-primary border-accent shadow-[0_0_15px_rgba(167,139,250,0.4)]"
                  : "bg-accent-muted border-accent/50 text-accent hover:bg-accent/20 hover:border-accent",
              )}
            >
              Let&apos;s Talk
            </Link>
          </m.div>

          {/* Mobile Menu Toggle */}
          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-accent-muted"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </m.button>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-bg-primary/95 backdrop-blur-2xl border-t border-glass-border"
          >
            <ul className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link, index) => {
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
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full border font-medium text-sm transition-all duration-300",
                    isActive("/contact")
                      ? "bg-accent text-bg-primary border-accent"
                      : "bg-accent-muted border-accent/50 text-accent hover:bg-accent/20",
                  )}
                >
                  Let&apos;s Talk
                </Link>
              </m.li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
