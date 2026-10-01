import type { IconType } from "react-icons";
import {
  SiBetterauth,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFramer,
  SiGit,
  SiGithub,
  SiGo,
  SiGraphql,
  SiLaravel,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiOpencode,
  SiPhp,
  SiPostgresql,
  SiPython,
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
  SiPython,
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
  SiGo,
  SiNginx,
  SiOpencode,
  SiPhp,
};

/** Spellings that don't match a Simple Icons name once normalized. */
const ALIASES: Record<string, string> = {
  nextjs: "nextdotjs",
  nodejs: "nodedotjs",
  reactjs: "react",
  postgres: "postgresql",
  tailwind: "tailwindcss",
  golang: "go",
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const LOOKUP = new Map(
  Object.entries(ICON_MAP).flatMap(([key, component]) => [
    [key.slice(2).toLowerCase(), component],
    [key.toLowerCase(), component],
  ]),
);

/**
 * Resolve an icon name (e.g. "SiReact", "Next.js", "node js") to a
 * react-icons component. Returns null if the name isn't in the lookup map.
 */
export function resolveIcon(iconName: string): IconType | null {
  const key = normalize(iconName);
  return LOOKUP.get(key) ?? LOOKUP.get(ALIASES[key] ?? "") ?? null;
}

/** Explicit iconName wins; otherwise match the skill name so logos still show. */
export function resolveIconForSkill(skill: {
  name: string;
  iconName?: string | null;
}): IconType | null {
  return (skill.iconName ? resolveIcon(skill.iconName) : null) ?? resolveIcon(skill.name);
}

export const isKnownIconName = (iconName: string) => resolveIcon(iconName) !== null;
