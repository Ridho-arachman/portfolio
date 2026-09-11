import { Code2, Database, Globe } from "lucide-react";

export type AboutAvatarProps = Record<string, never>;
export type AboutBackgroundProps = Record<string, never>;
export type AboutContentProps = Record<string, never>;
export type AvatarBackgroundProps = Record<string, never>;

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
