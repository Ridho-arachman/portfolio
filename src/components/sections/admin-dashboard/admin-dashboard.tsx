"use client";

import {
  Award,
  Briefcase,
  FolderKanban,
  FolderTree,
  MessageSquare,
} from "lucide-react";
import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useAdminProjects } from "@/hooks/use-projects";
import { useAdminCertificates } from "@/hooks/use-certificates";
import { useAdminExperiences } from "@/hooks/use-experience";
import { PanelCard } from "./panel-card";
import { StatCard } from "./stat-card";
import { VisitsChart } from "./visits-chart";
import { VisitorMap } from "./visitor-map";
import { ADMIN_DASHBOARD } from "./constants";
import type { RecentItem, VisitPoint, VisitorCountry } from "./constants";

interface AnalyticsData {
  visitsOverview: VisitPoint[];
  totalVisits: number;
  totalVisitsAllTime: number;
  deltaLabel: string;
  visitorLocations: VisitorCountry[];
  regions: string[];
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function ChartSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <div className="h-20 animate-pulse bg-white/5" />
      <div className="m-5 h-64 animate-pulse bg-white/5" />
    </section>
  );
}

function MapSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <div className="h-20 animate-pulse bg-white/5" />
      <div className="m-5 h-[460px] animate-pulse bg-white/5" />
    </section>
  );
}

function StatSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 p-5 backdrop-blur-xl">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-white/5" />
      <div className="mt-4 h-8 w-20 animate-pulse rounded bg-white/5" />
      <div className="mt-2 h-4 w-28 animate-pulse rounded bg-white/5" />
    </div>
  );
}

const QUICK_ACTION_LINKS: RecentItem[] = [
  {
    title: "Add New Project",
    subtitle: "Create a project entry",
    badge: "Projects",
    href: "/admin/projects/new",
  },
  {
    title: "Add Certificate",
    subtitle: "Add a new credential",
    badge: "Certificates",
    href: "/admin/certificates/new",
  },
  {
    title: "Read Messages",
    subtitle: "Check inbox",
    badge: "Messages",
    href: "/admin/messages",
  },
  {
    title: "Manage Categories",
    subtitle: "Organize projects",
    badge: "Categories",
    href: "/admin/categories",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProjects(items: any[]): RecentItem[] {
  return items.map((p) => ({
    title: (p.title as string) ?? "Untitled",
    subtitle: [p.year, p.role].filter(Boolean).join(" · ") || "—",
    badge: (Array.isArray(p.technologies) ? p.technologies[0] : null) ?? "Project",
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCertificates(items: any[]): RecentItem[] {
  return items.map((c) => ({
    title: (c.title as string) ?? "Untitled",
    subtitle: (c.issuer as string) ?? "—",
    badge: (Array.isArray(c.skills) ? c.skills[0] : null) ?? "Certificate",
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExperience(items: any[]): RecentItem[] {
  return items.map((e) => {
    const start = e.startDate ? new Date(e.startDate as string) : null;
    const end = e.endDate ? new Date(e.endDate as string) : null;
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const period =
      start && end
        ? `${fmt(start)} - ${fmt(end)}`
        : start
          ? `${fmt(start)} - Present`
          : "—";
    return {
      title: (e.title as string) ?? "Untitled",
      subtitle: `${e.company ?? "—"} · ${period}`,
      badge: (e.type as string) ?? "Experience",
    };
  });
}

export function AdminDashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<AnalyticsData>({
      queryKey: ["admin-analytics"],
      queryFn: async () => {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        return json.data;
      },
      staleTime: 5 * 60 * 1000,
    });

  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const { data: projectsData } = useAdminProjects({ pageSize: 3 });
  const { data: certificatesData } = useAdminCertificates({ pageSize: 3 });
  const { data: experienceData } = useAdminExperiences({ pageSize: 3 });

  const statCards = stats
    ? [
        {
          icon: FolderKanban,
          value: String(stats.projects),
          label: "Total Projects",
          delta: `${stats.projects} total`,
          tone: "up" as const,
        },
        {
          icon: Briefcase,
          value: String(stats.experiences),
          label: "Experience",
          delta: `${stats.experiences} total`,
          tone: "up" as const,
        },
        {
          icon: Award,
          value: String(stats.certificates),
          label: "Certificates",
          delta: `${stats.certificates} total`,
          tone: "up" as const,
        },
        {
          icon: MessageSquare,
          value: String(stats.messages),
          label: "Messages",
          delta: `${stats.unreadMessages} unread`,
          accent: true,
        },
      ]
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        {analyticsLoading ? (
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

        <m.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            : statCards.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
        </m.section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PanelCard
            title={ADMIN_DASHBOARD.recentProjectsLabel}
            icon={FolderKanban}
            items={projectsData?.data ? mapProjects(projectsData.data) : []}
          />
          <PanelCard
            title={ADMIN_DASHBOARD.recentCertificatesLabel}
            icon={Award}
            items={
              certificatesData?.data
                ? mapCertificates(certificatesData.data)
                : []
            }
          />
          <PanelCard
            title={ADMIN_DASHBOARD.recentExperienceLabel}
            icon={Briefcase}
            items={
              experienceData?.data ? mapExperience(experienceData.data) : []
            }
          />
          <PanelCard
            title={ADMIN_DASHBOARD.quickActionsLabel}
            icon={FolderTree}
            items={QUICK_ACTION_LINKS}
          />
        </section>
      </main>
    </div>
  );
}
