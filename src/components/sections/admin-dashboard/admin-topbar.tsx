"use client";

import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_DASHBOARD, ADMIN_NAV_LINKS } from "./constants";

export function AdminTopbar({ today }: { today: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
      {/* Mobile navigation */}
      <nav className="flex gap-1 overflow-x-auto px-4 py-3 lg:hidden" aria-label="Admin navigation">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const active = !link.disabled && pathname === link.href;

          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-text-secondary opacity-40 select-none"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </span>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
                active
                  ? "bg-accent-muted font-medium text-accent"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ADMIN_DASHBOARD.greeting}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_DASHBOARD.greetingSub}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs text-text-secondary sm:inline-flex">
            <CalendarDays className="h-3.5 w-3.5 text-accent" />
            {today}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View site
          </Link>
        </div>
      </div>
    </header>
  );
}
