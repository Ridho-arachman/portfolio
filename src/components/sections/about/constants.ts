import { Code2, Database, Globe } from "lucide-react";

export type AboutAvatarProps = Record<string, never>;
export type AboutBackgroundProps = Record<string, never>;
export type AboutContentProps = Record<string, never>;
export type AvatarBackgroundProps = Record<string, never>;

export const HIGHLIGHT_POINTS_KEYS = [
  { icon: Code2, titleKey: 'cleanCode', descKey: 'cleanCodeDesc' },
  { icon: Globe, titleKey: 'webPerformance', descKey: 'webPerformanceDesc' },
  { icon: Database, titleKey: 'dataDriven', descKey: 'dataDrivenDesc' },
] as const;
