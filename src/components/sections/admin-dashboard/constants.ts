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
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
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

export const VISITOR_MAP_LABEL = "Visitors by Location";
export const VISITOR_MAP_CAPTION = "Global · Last 30 days";
export const VISITOR_REGION_ALL = "All";
export const VISITOR_BACK_LABEL = "All countries";
export const VISITOR_CITIES_LABEL = (country: string) =>
  `Cities · ${country}`;
export const VISITOR_NO_CITIES_LABEL =
  "City data is not tracked for this entry yet.";

export const VISITOR_LOCATIONS: VisitorCountry[] = [
  {
    code: "id",
    country: "Indonesia",
    region: "Southeast Asia",
    flag: "🇮🇩",
    visits: 7522,
    cities: [
      { name: "Jakarta", visits: 2280, lat: -6.2, lng: 106.845 },
      { name: "Surabaya", visits: 980, lat: -7.2575, lng: 112.7521 },
      { name: "Bandung", visits: 925, lat: -6.9175, lng: 107.6191 },
      { name: "Yogyakarta", visits: 740, lat: -7.7956, lng: 110.3695 },
      { name: "Tangerang", visits: 640, lat: -6.1783, lng: 106.63 },
      { name: "Bekasi", visits: 580, lat: -6.2383, lng: 106.9756 },
      { name: "Semarang", visits: 420, lat: -6.9667, lng: 110.4167 },
      { name: "Bogor", visits: 370, lat: -6.5971, lng: 106.806 },
      { name: "Depok", visits: 287, lat: -6.4025, lng: 106.7942 },
      { name: "Malang", visits: 300, lat: -7.9666, lng: 112.6326 },
    ],
  },
  {
    code: "us",
    country: "United States",
    region: "Americas",
    flag: "🇺🇸",
    visits: 1864,
    cities: [
      { name: "New York", visits: 620, lat: 40.7128, lng: -74.006 },
      { name: "San Francisco", visits: 468, lat: 37.7749, lng: -122.4194 },
      { name: "Austin", visits: 402, lat: 30.2672, lng: -97.7431 },
      { name: "Seattle", visits: 374, lat: 47.6062, lng: -122.3321 },
    ],
  },
  {
    code: "in",
    country: "India",
    region: "South Asia",
    flag: "🇮🇳",
    visits: 1520,
    cities: [
      { name: "Mumbai", visits: 590, lat: 19.076, lng: 72.8777 },
      { name: "Bengaluru", visits: 486, lat: 12.9716, lng: 77.5946 },
      { name: "New Delhi", visits: 444, lat: 28.6139, lng: 77.209 },
    ],
  },
  {
    code: "sg",
    country: "Singapore",
    region: "Southeast Asia",
    flag: "🇸🇬",
    visits: 1048,
    cities: [{ name: "Singapore", visits: 1048, lat: 1.3521, lng: 103.8198 }],
  },
  {
    code: "my",
    country: "Malaysia",
    region: "Southeast Asia",
    flag: "🇲🇾",
    visits: 1102,
    cities: [
      { name: "Kuala Lumpur", visits: 540, lat: 3.139, lng: 101.6869 },
      { name: "Johor Bahru", visits: 302, lat: 1.4927, lng: 103.7414 },
      { name: "Penang", visits: 260, lat: 5.4141, lng: 100.3288 },
    ],
  },
  {
    code: "jp",
    country: "Japan",
    region: "East Asia",
    flag: "🇯🇵",
    visits: 722,
    cities: [
      { name: "Tokyo", visits: 400, lat: 35.6762, lng: 139.6503 },
      { name: "Osaka", visits: 322, lat: 34.6937, lng: 135.5023 },
    ],
  },
  {
    code: "nl",
    country: "Netherlands",
    region: "Europe",
    flag: "🇳🇱",
    visits: 686,
    cities: [
      { name: "Amsterdam", visits: 462, lat: 52.3676, lng: 4.9041 },
      { name: "Rotterdam", visits: 224, lat: 51.9244, lng: 4.4777 },
    ],
  },
  {
    code: "gb",
    country: "United Kingdom",
    region: "Europe",
    flag: "🇬🇧",
    visits: 532,
    cities: [
      { name: "London", visits: 380, lat: 51.5074, lng: -0.1278 },
      { name: "Manchester", visits: 152, lat: 53.4808, lng: -2.2426 },
    ],
  },
  {
    code: "de",
    country: "Germany",
    region: "Europe",
    flag: "🇩🇪",
    visits: 465,
    cities: [
      { name: "Berlin", visits: 296, lat: 52.52, lng: 13.405 },
      { name: "Munich", visits: 169, lat: 48.1351, lng: 11.582 },
    ],
  },
  {
    code: "au",
    country: "Australia",
    region: "Oceania",
    flag: "🇦🇺",
    visits: 380,
    cities: [
      { name: "Sydney", visits: 214, lat: -33.8688, lng: 151.2093 },
      { name: "Melbourne", visits: 166, lat: -37.8136, lng: 144.9631 },
    ],
  },
  {
    code: "sa",
    country: "Saudi Arabia",
    region: "Middle East",
    flag: "🇸🇦",
    visits: 290,
    cities: [
      { name: "Riyadh", visits: 170, lat: 24.7136, lng: 46.6753 },
      { name: "Jeddah", visits: 120, lat: 21.4858, lng: 39.1925 },
    ],
  },
  {
    code: "oth",
    country: "Others",
    region: "Others",
    visits: 390,
    cities: [],
  },
];

export const VISITOR_REGIONS = [
  "Southeast Asia",
  "Americas",
  "South Asia",
  "East Asia",
  "Europe",
  "Oceania",
  "Middle East",
  "Others",
] as const;
