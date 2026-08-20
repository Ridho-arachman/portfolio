"use client";

import { CalendarDays, ExternalLink, Menu, X } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useAdminSidebar } from "./admin-sidebar-context";
import { ADMIN_DASHBOARD } from "./constants";

export function AdminTopbar({ today }: { today: string }) {
  const { isOpen, closeSidebar, toggleSidebar } = useAdminSidebar();

  return (
    <m.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl"
    >
      {/* Mobile hamburger button */}
      <div className="lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors rounded-lg"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

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
    </m.header>
  );
}