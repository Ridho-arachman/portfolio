"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./navbar-logo";
import { DesktopNav } from "./desktop-nav";
import { NavCollapseClient } from "./nav-collapse-client";
import { LanguageSwitcher } from "./language-switcher";
import { CVDownload } from "./cv-download";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

          {/* Desktop: Language Switcher + CV Download */}
          <div className="hidden lg:flex items-center gap-3 animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
            <LanguageSwitcher />
            <CVDownload />
          </div>

          {/* Tablet & HP: hamburger menu */}
          <NavCollapseClient />
        </div>
      </div>
    </header>
  );
}