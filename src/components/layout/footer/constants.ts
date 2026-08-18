import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiGmail, SiX } from "react-icons/si";
import { getClientEnv } from "@/lib/env";

const env = getClientEnv();

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
    href: env.NEXT_PUBLIC_GITHUB_URL,
    icon: SiGithub,
    label: "GitHub",
  },
  {
    href: env.NEXT_PUBLIC_LINKEDIN_URL,
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: env.NEXT_PUBLIC_TWITTER_URL,
    icon: SiX,
    label: "X (Twitter)",
  },
  {
    href: `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`,
    icon: SiGmail,
    label: "Email",
  },
] as const;

export type SocialLink = (typeof SOCIAL_LINKS)[number];
export type QuickLink = (typeof QUICK_LINKS)[number];