import { type QuickLinkKey } from "@/lib/quick-links";
import { type SettingsSection } from "@/schema/settings";

/** Label nav cepat. Kuncinya tetap milik `@/lib/quick-links`. */
export const QUICK_LINK_LABELS: Record<QuickLinkKey, string> = {
  home: "Home",
  about: "About",
  projects: "Projects",
  experience: "Experience",
  certificates: "Certificates",
  contact: "Contact",
};

/** Baris Danger Zone: satu per section yang bisa di-reset lewat API. */
export const RESET_SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "socials", label: "Social links" },
  { key: "site", label: "Site" },
  { key: "quickLinks", label: "Quick links" },
];

export const ADMIN_SETTINGS = {
  title: "Settings",
  subtitle: "Manage your portfolio profile and preferences.",
  profileTitle: "Profile",
  profileSubtitle: "Public information shown on your portfolio.",
  socialsTitle: "Social Links",
  socialsSubtitle: "Links displayed in the footer and contact section.",
  siteTitle: "Site Settings",
  siteSubtitle: "Branding used across the site.",
  quickLinksTitle: "Quick Links",
  quickLinksSubtitle:
    "Which nav items appear in the quick-links bar, in the order shown.",
  quickLinkMoveUp: "Move {label} up",
  quickLinkMoveDown: "Move {label} down",
  securityTitle: "Security",
  securitySubtitle:
    "Change your admin password. Other sessions are signed out afterwards.",
  dangerTitle: "Danger Zone",
  dangerSubtitle:
    "Reset stored overrides. Values fall back to their NEXT_PUBLIC_* environment defaults, not deleted.",
  saveLabel: "Save Changes",
  savingLabel: "Saving...",
  savedLabel: "Saved",
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
  resetSectionNote: "Back to the NEXT_PUBLIC_* environment default.",
  dangerNote:
    "Resetting clears the stored overrides so those values come from the NEXT_PUBLIC_* environment variables again. The rows are kept, not deleted.",
  resetLabel: "Reset all settings",
  resetConfirmLabel: "Reset all?",
  resetSectionLabel: "Reset",
  resetSectionConfirmLabel: "Reset?",
  resetSectionAriaLabel: "Reset {label}",
  resetSectionConfirmAriaLabel: "Confirm reset: {label}",
  passwordSuccess: "Password updated. Other sessions have been signed out.",
  passwordError: "Could not update the password.",
} as const;
