"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./navbar-logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNavClient } from "./mobile-nav-client";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

const isActiveContact =
    pathname === "/contact" || pathname.startsWith("/contact");

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
          {/* 1. Logo */}
          <NavbarLogo />

          {/* 2. Desktop Navigation */}
          <nav role="navigation" aria-label="Main navigation">
            <DesktopNav />
          </nav>

          {/* 3. Desktop CTA Button */}
          <div className="hidden md:block animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center justify-center rounded-full font-medium text-sm px-6 py-3 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] min-w-[48px]",
                isActiveContact
                  ? "bg-accent text-bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:bg-accent-hover"
                  : "bg-text-primary text-bg-primary border border-text-primary hover:opacity-85",
              )}
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* 4. Mobile Menu (Client Component) */}
          <nav role="navigation" aria-label="Mobile navigation">
            <MobileNavClient />
          </nav>
        </div>
      </div>
    </header>
  );
}