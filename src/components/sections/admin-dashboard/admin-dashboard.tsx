"use client";

import { Award, Briefcase, FolderKanban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminTopbar } from "./admin-topbar";
import { PanelCard } from "./panel-card";
import { StatCard } from "./stat-card";
import { VisitsChart } from "./visits-chart";
import { VisitorMap } from "./visitor-map";
import {
  ADMIN_DASHBOARD,
  DASHBOARD_STATS,
  QUICK_ACTIONS,
  RECENT_CERTIFICATES,
  RECENT_EXPERIENCE,
  RECENT_PROJECTS,
} from "./constants";
import type { VisitPoint, VisitorCountry } from "./constants";

interface AnalyticsData {
  visitsOverview: VisitPoint[];
  totalVisits: number;
  totalVisitsAllTime: number;
  deltaLabel: string;
  visitorLocations: VisitorCountry[];
  regions: string[];
}

function ChartSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <div className="h-20 animate-pulse bg-white/5" />
      <div className="h-64 animate-pulse bg-white/5 m-5" />
    </section>
  );
}

function MapSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <div className="h-20 animate-pulse bg-white/5" />
      <div className="h-[460px] animate-pulse bg-white/5 m-5" />
    </section>
  );
}

export function AdminDashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopbar today={today} />

      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <MapSkeleton />
          </>
        ) : analytics ? (
          <>
            <VisitsChart
              visitsOverview={analytics.visitsOverview}
              totalVisits={analytics.totalVisits}
              deltaLabel={analytics.deltaLabel}
            />
            <VisitorMap
              visitorLocations={analytics.visitorLocations}
              totalVisits={analytics.totalVisits}
              deltaLabel={analytics.deltaLabel}
              regions={analytics.regions}
            />
          </>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DASHBOARD_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PanelCard
            title={ADMIN_DASHBOARD.recentProjectsLabel}
            icon={FolderKanban}
            items={RECENT_PROJECTS}
          />
          <PanelCard
            title={ADMIN_DASHBOARD.recentCertificatesLabel}
            icon={Award}
            items={RECENT_CERTIFICATES}
          />
          <PanelCard
            title={ADMIN_DASHBOARD.recentExperienceLabel}
            icon={Briefcase}
            items={RECENT_EXPERIENCE}
          />
          <PanelCard
            title={ADMIN_DASHBOARD.quickActionsLabel}
            icon={FolderKanban}
            items={QUICK_ACTIONS}
          />
        </section>
      </main>
    </div>
  );
}
