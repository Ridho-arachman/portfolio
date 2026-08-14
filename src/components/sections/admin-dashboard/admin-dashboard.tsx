import { Award, Briefcase, FolderKanban } from "lucide-react";
import { AdminTopbar } from "./admin-topbar";
import { PanelCard } from "./panel-card";
import { StatCard } from "./stat-card";
import { VisitsChart } from "./visits-chart";
import {
  ADMIN_DASHBOARD,
  DASHBOARD_STATS,
  QUICK_ACTIONS,
  RECENT_CERTIFICATES,
  RECENT_EXPERIENCE,
  RECENT_PROJECTS,
} from "./constants";

export function AdminDashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopbar today={today} />

      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <VisitsChart />
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

        <p className="text-center text-xs text-text-muted">
          {ADMIN_DASHBOARD.mockNote}
        </p>
      </main>
    </div>
  );
}
