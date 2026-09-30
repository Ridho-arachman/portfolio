"use client";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  projects: number;
  experiences: number;
  certificates: number;
  messages: number;
  unreadMessages: number;
}

export interface DashboardStatsRange {
  from?: string;
  to?: string;
}

export function useDashboardStats(range: DashboardStatsRange = {}) {
  const { from = "", to = "" } = range;
  return useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      const res = await fetch(
        `/api/admin/dashboard-stats${qs ? `?${qs}` : ""}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const json = await res.json();
      return json.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
