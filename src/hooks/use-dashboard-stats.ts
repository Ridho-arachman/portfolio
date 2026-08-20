"use client";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  projects: number;
  experiences: number;
  certificates: number;
  messages: number;
  unreadMessages: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard-stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const json = await res.json();
      return json.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
