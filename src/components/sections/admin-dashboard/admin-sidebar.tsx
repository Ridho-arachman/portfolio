"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import {
  ADMIN_DASHBOARD,
  ADMIN_NAV_LINKS,
  ADMIN_USER,
} from "./constants";

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.05 },
  },
};

const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
<m.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-20 hidden h-[calc(100vh-5rem)] w-72 shrink-0 flex-col border-r border-glass-border bg-glass-bg/60 backdrop-blur-xl lg:flex"
      >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-glass-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight">{ADMIN_DASHBOARD.brand}</p>
          <p className="text-xs text-text-muted">{ADMIN_DASHBOARD.brandSub}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const active = !link.disabled && pathname === link.href;

          if (link.disabled) {
            return (
              <m.span
                key={link.href}
                variants={navItemVariants}
                aria-disabled="true"
                className={cn(
                  "flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-secondary opacity-40 select-none",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{link.label}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Soon
                </span>
              </m.span>
            );
          }

          return (
            <m.div key={link.href} variants={navItemVariants}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                  active
                    ? "bg-accent-muted font-medium text-accent"
                    : "text-text-secondary hover:bg-glass-hover hover:text-text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{link.label}</span>
              </Link>
            </m.div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-glass-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-xs font-bold text-accent">
            {ADMIN_USER.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{ADMIN_USER.name}</p>
            <p className="truncate text-xs text-text-muted">{ADMIN_USER.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={ADMIN_DASHBOARD.logoutLabel}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-3 py-3 text-sm text-text-secondary transition-all hover:border-accent/40 hover:text-accent disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Signing out..." : ADMIN_DASHBOARD.logoutLabel}
        </button>
      </div>
    </m.aside>
  );
}
