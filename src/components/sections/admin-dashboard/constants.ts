import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";

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
  href?: string;
}

export const ADMIN_DASHBOARD = {
  brand: "Ridho.dev",
  brandSub: "Admin",
  greeting: "Welcome back, Ridho",
  greetingSub: "Here's what's happening with your portfolio today.",
  logoutLabel: "Logout",
  recentProjectsLabel: "Recent Projects",
  recentCertificatesLabel: "Recent Certificates",
  recentExperienceLabel: "Recent Experience",
  quickActionsLabel: "Quick Actions",
} as const;

export const ADMIN_USER = {
  name: "Ridho Arachman",
  role: "Administrator",
  initials: "RA",
} as const;

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export interface VisitPoint {
  date: string;
  visits: number;
}

export interface VisitorCity {
  name: string;
  visits: number;
  lat: number;
  lng: number;
}

export interface VisitorCountry {
  code: string;
  country: string;
  region: string;
  flag?: string;
  visits: number;
  cities: VisitorCity[];
}
