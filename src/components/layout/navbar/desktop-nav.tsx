"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./constants";

export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const linkStyle = {
    // Force minimum touch target and explicit contrast
    minHeight: "56px",
    minWidth: "56px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  };

  return (
    <ul className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map((link, index) => {
        const active = isActive(link.href);
        return (
          <li
            key={link.href}
            className="relative animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link
              href={link.href}
              className={cn(
                "relative px-6 py-4 rounded-full text-sm font-medium transition-colors duration-300 min-h-[56px] min-w-[56px] flex items-center justify-center",
                active
                  ? "bg-accent/10"
                  : "hover:bg-accent/5",
              )}
              style={linkStyle}
            >
              {link.label}

              {active && (
                <span className="absolute inset-0 rounded-full bg-accent-muted -z-10 animate-slide-in" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
