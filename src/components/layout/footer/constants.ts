import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiGmail, SiX } from "react-icons/si";

import type { SiteSettings } from "@/lib/settings";

/**
 * Meta statis saja, tanpa href. Nama brand adalah nama Proper, bukan copy,
 * jadi bukan milik admin; hanya URL-nya yang milik settings. Pemisahan itu
 * wajib: komponen client tidak bisa `await getSiteSettings()` (server-only),
 * dan `process.env.NEXT_PUBLIC_*` di-inline saat build sehingga tidak pernah
 * bisa membaca nilai database.
 *
 * `key` = nama kolom di tabel `site_settings`, agar pemetaannya ke settings
 * hanya lewat nama, tanpa tabel translate terpisah.
 */
export const SOCIAL_LINK_META = [
  { key: "github", label: "GitHub", icon: SiGithub },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { key: "twitter", label: "X (Twitter)", icon: SiX },
  { key: "email", label: "Email Ridho", icon: SiGmail },
] as const;

export type SocialLinkKey = (typeof SOCIAL_LINK_META)[number]["key"];

export interface SocialLink {
  key: SocialLinkKey;
  label: string;
  href: string;
  icon: (typeof SOCIAL_LINK_META)[number]["icon"];
}

/**
 * Sumber tunggal untuk footer dan contact. URL kosong disembunyikan, bukan
 * dirender jadi tautan mati: admin boleh mengosongkan kolom, dan tautan ke
 * `mailto:` tanpa alamat adalah bug yang tidak terlihat sampai diklik.
 */
export function resolveSocialLinks(settings: SiteSettings): SocialLink[] {
  const email = settings.contactEmail.trim();
  const hrefs: Record<SocialLinkKey, string> = {
    github: settings.githubUrl.trim(),
    linkedin: settings.linkedinUrl.trim(),
    twitter: settings.twitterUrl.trim(),
    email: email ? `mailto:${email}` : "",
  };

  return SOCIAL_LINK_META.flatMap(({ key, label, icon }) =>
    hrefs[key] ? [{ key, label, href: hrefs[key], icon }] : [],
  );
}
