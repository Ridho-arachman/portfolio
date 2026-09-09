import { Code2, Database, Globe } from "lucide-react";

export interface AboutAvatarProps {}

export interface AboutBackgroundProps {}

export interface AboutContentProps {}

export interface AvatarBackgroundProps {}

export const HIGHLIGHT_POINTS = [
  {
    icon: Code2,
    title: "Clean Code",
    desc: "Type-safe & Maintainable",
  },
  {
    icon: Globe,
    title: "Web Performance",
    desc: "Optimized & Fast",
  },
  {
    icon: Database,
    title: "Data Driven",
    desc: "Scalable Architecture",
  },
] as const;
