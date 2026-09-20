"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarScrollEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function NavbarScrollEffect({ children, className }: NavbarScrollEffectProps) {
  const headerRef = useRef<HTMLElement>(null);
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

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 isolate transition-colors duration-300 animate-fade-in-down",
        isScrolled
          ? "bg-white dark:bg-gray-950 border-b border-glass-border shadow-sm"
          : "bg-white dark:bg-gray-950",
        className
      )}
    >
      {children}
    </header>
  );
}