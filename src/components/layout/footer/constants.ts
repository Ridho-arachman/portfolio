import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiGmail, SiX } from "react-icons/si";

export const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Certificates", href: "/certificates" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = [
  {
    href: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/Ridho-arachman",
    icon: SiGithub,
    label: "GitHub",
  },
  {
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://linkedin.com/in/ridho-arachman",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: process.env.NEXT_PUBLIC_TWITTER_URL ?? "https://twitter.com/ridho_arachman",
    icon: SiX,
    label: "X (Twitter)",
  },
  {
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ridho@example.com"}`,
    icon: SiGmail,
    label: "Email",
  },
] as const;

export type SocialLink = (typeof SOCIAL_LINKS)[number];
export type QuickLink = (typeof QUICK_LINKS)[number];