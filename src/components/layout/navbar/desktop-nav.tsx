"use client";

import { cn } from "@/lib/utils";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./constants";

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
  );
}
