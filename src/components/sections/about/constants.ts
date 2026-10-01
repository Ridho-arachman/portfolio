import { Code2, Database, Globe, type LucideIcon } from "lucide-react";
import type { Messages } from "@/lib/translation-types";

export type AboutAvatarProps = Record<string, never>;
export type AboutBackgroundProps = Record<string, never>;
export type AboutContentProps = Record<string, never>;
export type AvatarBackgroundProps = Record<string, never>;

/**
 * Hanya leaf string dari `about`. `keyof typeof t.about` juga memuat objek
 * nested, yang melebarkan hasil indeks jadi `string | object`.
 */
export type AboutTextKey = {
  [K in keyof Messages["about"]]: Messages["about"][K] extends string ? K : never;
}[keyof Messages["about"]];

export const HIGHLIGHT_POINTS_KEYS: readonly {
  icon: LucideIcon;
  titleKey: AboutTextKey;
  descKey: AboutTextKey;
}[] = [
  { icon: Code2, titleKey: 'cleanCode', descKey: 'cleanCodeDesc' },
  { icon: Globe, titleKey: 'webPerformance', descKey: 'webPerformanceDesc' },
  { icon: Database, titleKey: 'dataDriven', descKey: 'dataDrivenDesc' },
];
