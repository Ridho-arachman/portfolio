"use client";

import { LogOut, ShieldCheck, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "./admin-sidebar-context";
import {
  ADMIN_DASHBOARD,
  ADMIN_NAV_LINKS,
  ADMIN_USER,
} from "./constants";

export function AdminMobileSidebar() {
  const { isOpen, closeSidebar } = useAdminSidebar();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          {/* Sidebar Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] flex-col border-r border-glass-border bg-glass-bg/95 backdrop-blur-xl lg:hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-glass-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">{ADMIN_DASHBOARD.brand}</p>
                  <p className="text-xs text-text-muted">{ADMIN_DASHBOARD.brandSub}</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {ADMIN_NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = !link.disabled && pathname === link.href;

                if (link.disabled) {
                  return (
                    <span
                      key={link.href}
                      aria-disabled="true"
                      className={cn(
                        "flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-secondary opacity-40 select-none",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{link.label}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Soon
                      </span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeSidebar}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                      active
                        ? "bg-accent-muted font-medium text-accent"
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{link.label}</span>
                  </Link>
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
              <Link
                href="/admin/login"
                onClick={closeSidebar}
                title={ADMIN_DASHBOARD.logoutLabel}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-3 py-3 text-sm text-text-secondary transition-all hover:border-accent/40 hover:text-accent"
              >
                <LogOut className="h-4 w-4" />
                {ADMIN_DASHBOARD.logoutLabel}
              </Link>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}