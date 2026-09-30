"use client";

import {
  Award,
  Briefcase,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  FolderTree,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import "nuqs/adapters/next";
import { useQueryState, parseAsString } from "nuqs";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import type { SystemReport } from "@/lib/report-export";
import { useAdminProjects } from "@/hooks/use-projects";
import { useAdminCertificates } from "@/hooks/use-certificates";
import { useAdminExperiences } from "@/hooks/use-experience";
import { PanelCard } from "./panel-card";
import { StatCard } from "./stat-card";
import { ADMIN_DASHBOARD } from "./constants";
import type { RecentItem, VisitPoint, VisitorCountry } from "./constants";
import type { AdminProject } from "@/components/sections/admin-projects/constants";
import type { AdminCertificate } from "@/components/sections/admin-certificates/constants";
import type { AdminExperience } from "@/components/sections/admin-experience/constants";

// Lazy-load heavy admin components (recharts, leaflet) - admin only
const VisitsChart = dynamic(() => import("./visits-chart").then((mod) => mod.VisitsChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const VisitorMap = dynamic(() => import("./visitor-map").then((mod) => mod.VisitorMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

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

function mapProjects(items: AdminProject[]): RecentItem[] {
  return items.map((p) => ({
    title: p.title ?? "Untitled",
    subtitle: [p.year, p.role].filter(Boolean).join(" · ") || "—",
    badge: (Array.isArray(p.technologies) ? p.technologies[0] : null) ?? "Project",
  }));
}

function mapCertificates(items: AdminCertificate[]): RecentItem[] {
  return items.map((c) => ({
    title: c.title ?? "Untitled",
    subtitle: c.issuer ?? "—",
    badge: (Array.isArray(c.skills) ? c.skills[0] : null) ?? "Certificate",
  }));
}

function mapExperience(items: AdminExperience[]): RecentItem[] {
  return items.map((e) => {
    const start = e.startDate ? new Date(e.startDate) : null;
    const end = e.endDate ? new Date(e.endDate) : null;
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const period =
      start && end
        ? `${fmt(start)} - ${fmt(end)}`
        : start
          ? `${fmt(start)} - Present`
          : "—";
    return {
      title: e.title ?? "Untitled",
      subtitle: `${e.company ?? "—"} · ${period}`,
      badge: e.type ?? "Experience",
    };
  });
}

export function AdminDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const [fromStr, setFromStr] = useQueryState(
    "from",
    parseAsString.withDefault(""),
  );
  const [toStr, setToStr] = useQueryState("to", parseAsString.withDefault(""));
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<AnalyticsData>({
      queryKey: ["admin-analytics", fromStr, toStr],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (fromStr) params.set("from", fromStr);
        if (toStr) params.set("to", toStr);
        const qs = params.toString();
        const res = await fetch(`/api/admin/analytics${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        return json.data;
      },
      staleTime: 5 * 60 * 1000,
    });

  const { data: stats, isLoading: statsLoading } = useDashboardStats({
    from: fromStr || undefined,
    to: toStr || undefined,
  });

  function handleReset() {
    void setFromStr("");
    void setToStr("");
  }

  async function handleExport(kind: "xlsx" | "pdf") {
    if (exporting) return;
    setExporting(kind);
    try {
      const params = new URLSearchParams();
      if (fromStr) params.set("from", fromStr);
      if (toStr) params.set("to", toStr);
      const qs = params.toString();
      const res = await axios.get(`/api/admin/report${qs ? `?${qs}` : ""}`);
      // Dynamic import keeps the export utils out of the initial bundle.
      const { generateReportXlsx, generateReportPdf } =
        await import("@/lib/report-export");
      const body = res.data as { data?: SystemReport } | SystemReport;
      const report: SystemReport =
        "data" in body && body.data ? body.data : (body as SystemReport);
      if (!report || typeof report !== "object" || !report.counts)
        throw new Error("Invalid report response");
      if (kind === "xlsx") generateReportXlsx(report);
      else generateReportPdf(report);
      toast.success("Report exported");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.status === 401
          ? "Sesi berakhir"
          : err instanceof Error
            ? err.message
            : "Export failed";
      toast.error(message);
    } finally {
      setExporting(null);
    }
  }

  const { data: projectsData } = useAdminProjects({ pageSize: 3 });
  const { data: certificatesData } = useAdminCertificates({ pageSize: 3 });
  const { data: experienceData } = useAdminExperiences({ pageSize: 3 });

  const statCards = [
    {
      icon: FolderKanban,
      value: String(stats?.projects ?? 0),
      label: "Total Projects",
      delta: `${stats?.projects ?? 0} total`,
      tone: "up" as const,
    },
    {
      icon: Briefcase,
      value: String(stats?.experiences ?? 0),
      label: "Experience",
      delta: `${stats?.experiences ?? 0} total`,
      tone: "up" as const,
    },
    {
      icon: Award,
      value: String(stats?.certificates ?? 0),
      label: "Certificates",
      delta: `${stats?.certificates ?? 0} total`,
      tone: "up" as const,
    },
    {
      icon: MessageSquare,
      value: String(stats?.messages ?? 0),
      label: "Messages",
      delta: `${stats?.unreadMessages ?? 0} unread`,
      accent: true,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section
          aria-label="Filter periode dan export laporan"
          className="rounded-2xl border border-glass-border bg-glass-bg/80 p-4 backdrop-blur-xl sm:p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <legend className="mb-2 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Periode
              </legend>
              <div className="flex-1">
                <label
                  htmlFor="report-from"
                  className="mb-1.5 block text-xs font-medium text-text-secondary"
                >
                  Dari
                </label>
                <input
                  id="report-from"
                  type="date"
                  value={fromStr}
                  max={toStr || undefined}
                  onChange={(event) => void setFromStr(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-glass-border bg-bg-primary/60 px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent/50 dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="report-to"
                  className="mb-1.5 block text-xs font-medium text-text-secondary"
                >
                  Sampai
                </label>
                <input
                  id="report-to"
                  type="date"
                  value={toStr}
                  min={fromStr || undefined}
                  onChange={(event) => void setToStr(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-glass-border bg-bg-primary/60 px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent/50 dark:[color-scheme:dark]"
                />
              </div>
              <button
                type="button"
                onClick={handleReset}
                disabled={!fromStr && !toStr}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-glass-border bg-bg-primary/60 px-4 text-sm font-medium text-text-secondary transition-colors outline-none hover:border-accent/40 hover:text-accent focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </fieldset>
            <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
              <button
                type="button"
                onClick={() => void handleExport("xlsx")}
                disabled={exporting !== null}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-glass-border bg-bg-primary/60 px-4 text-sm font-medium text-text-primary transition-colors outline-none hover:border-accent/40 hover:text-accent focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
              </button>
              <button
                type="button"
                onClick={() => void handleExport("pdf")}
                disabled={exporting !== null}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-bg-primary transition-all outline-none hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                {exporting === "pdf" ? "Exporting…" : "Export PDF"}
              </button>
            </div>
          </div>
        </section>

        <m.section
          variants={staggerContainer}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            : statCards.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
        </m.section>

        {analyticsLoading ? (
          <ChartSkeleton />
        ) : analytics ? (
          <VisitsChart
            visitsOverview={analytics.visitsOverview}
            totalVisits={analytics.totalVisits}
            deltaLabel={analytics.deltaLabel}
          />
        ) : null}

        {analyticsLoading ? (
          <MapSkeleton />
        ) : analytics ? (
          <VisitorMap
            visitorLocations={analytics.visitorLocations}
            totalVisits={analytics.totalVisits}
            deltaLabel={analytics.deltaLabel}
            regions={analytics.regions}
          />
        ) : null}

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
