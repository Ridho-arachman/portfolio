import type { IconType } from "react-icons";
import {
  SiBetterauth,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFramer,
  SiGit,
  SiGithub,
  SiGraphql,
  SiLaravel,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiRedis,
  SiShadcnui,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVuedotjs,
  SiZod,
} from "react-icons/si";

/**
 * Lookup map: icon name string -> react-icons component.
 * Keys use the Simple Icons convention (e.g. "SiReact").
 */
const ICON_MAP: Record<string, IconType> = {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPrisma,
  SiPostgresql,
  SiSupabase,
  SiFramer,
  SiZod,
  SiVercel,
  SiLaravel,
  SiShadcnui,
  SiBetterauth,
  SiDocker,
  SiGit,
  SiGithub,
  SiGraphql,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNodedotjs,
  SiRedis,
  SiExpress,
  SiFigma,
  SiVuedotjs,
};

/**
 * Resolve an iconName string (e.g. "SiReact") to a react-icons component.
 * Supports both prefixed ("SiReact") and unprefixed ("React") names.
 * Returns null if the name isn't in the lookup map.
 */
export function resolveIcon(iconName: string): IconType | null {
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  const unprefixed = iconName.replace(/^Si/, "");
  for (const [key, component] of Object.entries(ICON_MAP)) {
    if (key.replace(/^Si/, "") === unprefixed) return component;
  }
  return null;
}
