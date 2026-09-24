import { SOCIAL_LINKS } from "@/components/layout/footer/constants";
import {
  CONTACT_EMAIL,
} from "@/components/sections/contact/constants";

export interface AdminProfile {
  fullName: string;
  title: string;
  email: string;
  location: string;
  bio: string;
}

export interface AdminSocials {
  github: string;
  linkedin: string;
  x: string;
  email: string;
}

export interface AdminSite {
  siteName: string;
  tagline: string;
}

export interface AdminSettings {
  profile: AdminProfile;
  socials: AdminSocials;
  site: AdminSite;
}

function findSocial(label: string) {
  return SOCIAL_LINKS.find((item) => item.label === label)?.href ?? "";
}

const SEED_EMAIL = findSocial("Email").replace(/^mailto:/, "") || CONTACT_EMAIL;

export const SEED_SETTINGS: AdminSettings = {
  profile: {
    fullName: "Ridho Arachman",
    title: "Web Developer",
    email: SEED_EMAIL,
    location: "Indonesia (Remote-ready)",
    bio: "Recent Information Systems graduate with a deep passion for crafting immersive, high-performance, and user-centric web experiences.",
  },
  socials: {
    github: findSocial("GitHub"),
    linkedin: findSocial("LinkedIn"),
    x: findSocial("X (Twitter)"),
    email: SEED_EMAIL,
  },
  site: {
    siteName: "Ridho.dev",
    tagline: "Web3 Portfolio",
  },
};

export const ADMIN_SETTINGS = {
  title: "Settings",
  subtitle: "Manage your portfolio profile and preferences.",
  profileTitle: "Profile",
  profileSubtitle: "Public information shown on your portfolio.",
  socialsTitle: "Social Links",
  socialsSubtitle: "Links displayed in the footer and contact section.",
  siteTitle: "Site Settings",
  siteSubtitle: "Branding used across the site.",
  securityTitle: "Security",
  securitySubtitle: "Update your admin password (mockup).",
  dangerTitle: "Danger Zone",
  dangerSubtitle: "Destructive actions that reset mockup data.",
  saveLabel: "Save Changes",
  savingLabel: "Saving...",
  savedLabel: "Saved <Check className='w-4 h-4 inline' />",
  fieldFullName: "Full Name",
  fieldTitle: "Title / Role",
  fieldEmail: "Email",
  fieldLocation: "Location",
  fieldBio: "Bio",
  fieldBioPlaceholder: "Short bio shown on the about section.",
  fieldGithub: "GitHub URL",
  fieldLinkedin: "LinkedIn URL",
  fieldX: "X (Twitter) URL",
  fieldSocialEmail: "Email",
  fieldSiteName: "Site Name",
  fieldTagline: "Tagline",
  fieldCurrentPassword: "Current Password",
  fieldNewPassword: "New Password",
  fieldConfirmPassword: "Confirm New Password",
  passwordMockNote:
    "Mockup — password tidak benar-benar diubah, integrasi auth menyusul.",
  dangerNote:
    "This resets profile, social links and site settings to the default seed data.",
  resetLabel: "Reset all settings",
  resetConfirmLabel: "Reset all?",
  mockNote: "Mockup — data disimpan di localStorage, integrasi backend menyusul.",
} as const;
