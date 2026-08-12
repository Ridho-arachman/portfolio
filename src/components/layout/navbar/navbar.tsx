"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { NavbarLogo } from "./navbar-logo";
import { useNavbarScroll } from "./use-navbar-scroll";

export function Navbar() {
  const pathname = usePathname();
  const isScrolled = useNavbarScroll();

  const isActiveContact =
    pathname === "/contact" || pathname.startsWith("/contact");

  return (
    <m.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "py-3 bg-bg-primary/60 backdrop-blur-2xl border-b border-glass-border shadow-sm"
          : "py-5 bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* 1. Logo */}
          <NavbarLogo />

          {/* 2. Desktop Navigation */}
          <DesktopNav />

          {/* 3. Desktop CTA Button (Shadcn UI) */}
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button
              className={cn(
                "rounded-full font-medium text-sm transition-all duration-300",
                isActiveContact
                  ? "bg-accent text-bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:bg-accent-hover"
                  : "bg-accent-muted border border-accent/50 text-accent hover:bg-accent/20 hover:border-accent",
              )}
            >
              <Link href="/contact">Let&apos;s Talk</Link>
            </Button>
          </m.div>

          {/* 4. Mobile Menu (Toggle + Dropdown) */}
          <MobileNav />
        </nav>
      </div>
    </m.header>
  );
}
