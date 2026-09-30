"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";

// Desktop sidebar dan mobile drawer sama-sama memanggil hook ini; cache TanStack
// Query dedupe berdasarkan queryKey, jadi tetap satu request.
export function AdminUnreadBadge() {
  const { data } = useDashboardStats();
  const unread = data?.unreadMessages ?? 0;

  if (unread <= 0) return null;

  return (
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-bg-primary">
      {unread > 99 ? "99+" : unread}
    </span>
  );
}
