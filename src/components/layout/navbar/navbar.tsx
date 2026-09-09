"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300 animate-fade-in-down",
        isScrolled
          ? "bg-bg-primary/60 backdrop-blur-2xl border-b border-glass-border shadow-sm"
          : "bg-transparent",
      )}
    >
      {/* Tinggi total header selalu 80px (h-20) agar offset pt-20 pada
          <main> presisi di semua state scroll. */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* 1. Logo */}
          <NavbarLogo />

          {/* 2. Desktop Navigation */}
          <DesktopNav />

          {/* 3. Desktop CTA Button (Shadcn UI) */}
          <div className="hidden md:block animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
            <Button
              className={cn(
                "rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95",
                isActiveContact
                  ? "bg-accent text-bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:bg-accent-hover"
                  : "bg-accent-muted border border-accent/50 text-accent hover:bg-accent/20 hover:border-accent",
              )}
            >
              <Link href="/contact">Let&apos;s Talk</Link>
            </Button>
          </div>

          {/* 4. Mobile Menu (Toggle + Dropdown) */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}