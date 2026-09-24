/**
 * Canonical domain types — single source of truth for shared types.
 * Feature modules re-export from here to avoid duplication.
 */

// ============================================================================
// Locale & i18n
// ============================================================================

export type Locale = "en" | "id";
export const LOCALES = ["en", "id"] as const;

// ============================================================================
// Auth / Roles
// ============================================================================

export type UserRole = "USER" | "ADMIN";

// ============================================================================
// Message
// ============================================================================

export type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";
export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

// ============================================================================
// Skill
// ============================================================================

export type SkillCategory =
  | "FRONTEND"
  | "BACKEND"
  | "DATABASE"
  | "DEVOPS_TOOLS"
  | "SOFT_SKILL";
export const SKILL_CATEGORIES = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS_TOOLS",
  "SOFT_SKILL",
] as const;

// ============================================================================
// Experience
// ============================================================================

export type ExperienceType = "WORK" | "ORGANIZATION" | "FREELANCE" | "EDUCATION" | "CERTIFICATION";

export const EXPERIENCE_TYPES = [
  { value: "WORK", label: "Work", badgeClass: "bg-accent-muted text-accent" },
  {
    value: "ORGANIZATION",
    label: "Organization",
    badgeClass: "bg-sky-500/10 text-sky-400",
  },
  {
    value: "FREELANCE",
    label: "Freelance",
    badgeClass: "bg-amber-500/10 text-amber-400",
  },
  {
    value: "EDUCATION",
    label: "Education",
    badgeClass: "bg-emerald-500/10 text-emerald-400",
  },
  {
    value: "CERTIFICATION",
    label: "Certification",
    badgeClass: "bg-violet-500/10 text-violet-400",
  },
] as const;

// Base experience shape (matches Prisma Experience model)
export interface ExperienceBase {
  id: string;
  slug: string;
  title: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  logoUrl: string | null;
  gallery: string[];
  description: string[];
  isPublished: boolean;
  order: number;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Public-facing experience (subset for public pages)
export interface ExperiencePublic {
  id: string;
  slug: string;
  title: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  gallery: string[];
  description: string[];
  isPublished: boolean;
  order: number;
}

// Admin experience (full Prisma shape)
export type AdminExperience = ExperienceBase;

// Experience for list views
export interface ExperienceListData {
  id: number;
  slug: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  gallery?: string[];
  description: string[];
}

// Mapped experience (for transformed data)
export interface MappedExperience {
  id: string;
  role: string;
  company: string;
  type: ExperienceType;
  period: string;
  location: string;
  thumbnail: string | null;
  gallery: string[];
  description: string[];
  isPublished: boolean;
  order: number;
}

// ============================================================================
// Project
// ============================================================================

// Base project shape (matches Prisma Project model)
export interface ProjectBase {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  technologies: string[];
  role: string | null;
  year: string | null;
  highlights: string[];
  isPublished: boolean;
  order: number;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Public-facing project (subset for public pages)
export interface ProjectPublic {
  id: number;
  slug: string;
  title: string;
  description?: string;
  image: string;
  tags: string[];
  link: string;
  role?: string;
  year?: string;
  gallery?: string[];
  highlights?: string[];
}

// Admin project (full Prisma shape)
export type AdminProject = ProjectBase;

// Database project (for internal mapping)
export interface DbProject {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  technologies: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  gallery: string[];
  role: string | null;
  year: string | null;
  highlights: string[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
}

// ============================================================================
// Certificate
// ============================================================================

// Base certificate shape (matches Prisma Certificate model)
export interface CertificateBase {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  logoUrl: string | null;
  thumbnail: string | null;
  gallery: string[];
  credentialId: string | null;
  credentialUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  skills: string[];
  summary: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  period?: string; // Computed field for display
}

// Public-facing certificate (subset for public pages)
export interface CertificatePublic {
  id: number;
  slug: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  period: string;
  thumbnail: string | null;
  gallery: string[];
  skills: string[];
  summary: string[];
}

// Admin certificate (full Prisma shape)
export type AdminCertificate = CertificateBase;

// ============================================================================
// Category
// ============================================================================

export interface CategoryBase {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminCategory = CategoryBase;

// ============================================================================
// Skill
// ============================================================================

export interface SkillBase {
  id: string;
  name: string;
  iconName: string | null;
  category: SkillCategory;
  proficiency: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminSkill = SkillBase;

// ============================================================================
// Settings
// ============================================================================

export interface AdminProfile {
  name: string;
  email: string;
  image?: string;
}

export interface AdminSocials {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface AdminSite {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
}

export interface AdminSettings {
  profile: AdminProfile;
  socials: AdminSocials;
  site: AdminSite;
}

// ============================================================================
// Visitor / Analytics
// ============================================================================

export interface VisitPoint {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export interface VisitorCountry {
  code: string;
  name: string;
  visits: number;
}

export interface VisitorCity {
  city: string;
  country: string;
  countryCode: string;
  visits: number;
  lat: number;
  lng: number;
}

export interface DashboardStat {
  label: string;
  value: number;
  change?: number;
  trend?: "up" | "down" | "neutral";
}