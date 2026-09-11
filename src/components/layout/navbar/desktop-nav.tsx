"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./constants";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";

export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <ul className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map((link, index) => {
        const active = isActive(link.href);
        return (
          <li key={link.href} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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
                <span className="absolute inset-0 rounded-full bg-accent-muted -z-10 animate-slide-in" />
              )}
            </Link>
          </li>
        );
      })}

      {/* Theme Toggle */}
      <li className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <ThemeToggleFloating />
      </li>
    </ul>
  );
}
