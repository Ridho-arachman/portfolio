import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiGmail, SiX } from "react-icons/si";

export const QUICK_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = [
  {
    href: "https://github.com/Ridho-arachman",
    icon: SiGithub,
    label: "GitHub",
  },
  {
    href: "https://linkedin.com/in/ridho-arachman",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/ridho_arachman",
    icon: SiX,
    label: "X (Twitter)",
  },
  {
    href: "mailto:ridho@example.com",
    icon: SiGmail,
    label: "Email",
  },
] as const;

export type SocialLink = (typeof SOCIAL_LINKS)[number];
export type QuickLink = (typeof QUICK_LINKS)[number];
