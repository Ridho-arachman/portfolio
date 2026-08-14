import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import { CERTIFICATES_LIST } from "@/components/sections/certificates/constants";
import { EXPERIENCES_LIST } from "@/components/sections/experience-list/constants";
import { FEATURED_PROJECTS } from "@/components/sections/projects/constants";

export interface AdminNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export interface DashboardStat {
  icon: LucideIcon;
  value: string;
  label: string;
  delta: string;
  tone?: "up" | "neutral";
  accent?: boolean;
}

export interface RecentItem {
  title: string;
  subtitle: string;
  badge: string;
}

export const ADMIN_DASHBOARD = {
  brand: "Ridho.dev",
  brandSub: "Admin",
  greeting: "Welcome back, Ridho",
  greetingSub: "Here's what's happening with your portfolio today.",
  logoutLabel: "Logout",
  logoutTitle: "Logout (mockup)",
  recentProjectsLabel: "Recent Projects",
  recentCertificatesLabel: "Recent Certificates",
  recentExperienceLabel: "Recent Experience",
  quickActionsLabel: "Quick Actions",
  mockNote: "Mockup — statis, integrasi backend menyusul.",
} as const;

export const ADMIN_USER = {
  name: "Ridho Arachman",
  role: "Administrator",
  initials: "RA",
} as const;

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    disabled: true,
  },
];

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    icon: FolderKanban,
    value: String(FEATURED_PROJECTS.length),
    label: "Total Projects",
    delta: "+2 this month",
    tone: "up",
  },
  {
    icon: Briefcase,
    value: String(EXPERIENCES_LIST.length),
    label: "Experience",
    delta: "+1 this year",
    tone: "up",
  },
  {
    icon: Award,
    value: String(CERTIFICATES_LIST.length),
    label: "Certificates",
    delta: "+1 this year",
    tone: "up",
  },
  {
    icon: MessageSquare,
    value: "24",
    label: "Messages",
    delta: "8 unread",
    accent: true,
  },
];

export const RECENT_PROJECTS: RecentItem[] = FEATURED_PROJECTS.slice(0, 4).map(
  (project) => ({
    title: project.title,
    subtitle: `${project.year} · ${project.role ?? "Web Project"}`,
    badge: project.tags[0] ?? "Web",
  }),
);

export const RECENT_CERTIFICATES: RecentItem[] = CERTIFICATES_LIST.slice(
  0,
  4,
).map((cert) => ({
  title: cert.title,
  subtitle: cert.issuer,
  badge: cert.skills[0] ?? "Certified",
}));

export const RECENT_EXPERIENCE: RecentItem[] = EXPERIENCES_LIST.slice(0, 4).map(
  (exp) => ({
    title: exp.role,
    subtitle: `${exp.company} · ${exp.period}`,
    badge: exp.type,
  }),
);

export const QUICK_ACTIONS: RecentItem[] = [
  {
    title: "Add New Project",
    subtitle: "Create a project entry",
    badge: "Projects",
  },
  {
    title: "Publish Certificate",
    subtitle: "Add a new credential",
    badge: "Certificates",
  },
  {
    title: "Read Messages",
    subtitle: "Check inbox (mock)",
    badge: "Messages",
  },
  {
    title: "Update Profile",
    subtitle: "Edit about & skills",
    badge: "Settings",
  },
];

export interface VisitPoint {
  date: string;
  visits: number;
}

export const VISITS_OVERVIEW_LABEL = "Visits Overview";
export const VISITS_OVERVIEW_CAPTION = "Daily visits · Last 30 days";
export const VISITS_OVERVIEW_DELTA = "+18.2% vs last month";
export const TOTAL_VISITS_LABEL = "Total visits (30d)";

export const VISITS_OVERVIEW: VisitPoint[] = [
  { date: "Jul 16", visits: 288 },
  { date: "Jul 17", visits: 312 },
  { date: "Jul 18", visits: 345 },
  { date: "Jul 19", visits: 380 },
  { date: "Jul 20", visits: 362 },
  { date: "Jul 21", visits: 334 },
  { date: "Jul 22", visits: 356 },
  { date: "Jul 23", visits: 402 },
  { date: "Jul 24", visits: 428 },
  { date: "Jul 25", visits: 460 },
  { date: "Jul 26", visits: 486 },
  { date: "Jul 27", visits: 468 },
  { date: "Jul 28", visits: 431 },
  { date: "Jul 29", visits: 452 },
  { date: "Jul 30", visits: 505 },
  { date: "Jul 31", visits: 538 },
  { date: "Aug 1", visits: 570 },
  { date: "Aug 2", visits: 601 },
  { date: "Aug 3", visits: 574 },
  { date: "Aug 4", visits: 540 },
  { date: "Aug 5", visits: 566 },
  { date: "Aug 6", visits: 618 },
  { date: "Aug 7", visits: 644 },
  { date: "Aug 8", visits: 682 },
  { date: "Aug 9", visits: 720 },
  { date: "Aug 10", visits: 694 },
  { date: "Aug 11", visits: 655 },
  { date: "Aug 12", visits: 678 },
  { date: "Aug 13", visits: 735 },
  { date: "Aug 14", visits: 768 },
];

export const TOTAL_VISITS = VISITS_OVERVIEW.reduce(
  (sum, point) => sum + point.visits,
  0,
);
export const TOTAL_VISITS_FORMATTED = TOTAL_VISITS.toLocaleString("en-US");
