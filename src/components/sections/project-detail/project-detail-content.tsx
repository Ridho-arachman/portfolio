"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Package, Rocket, Sparkles } from "lucide-react";
import { SiGithub } from "react-icons/si";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

interface ProjectDetailContentProps {
  project: Project;
}

export function ProjectDetailContent({ project }: ProjectDetailContentProps) {
  const { t } = useTranslation();
  // Destructure with defaults to ensure no undefined access
  const description = project?.description ?? "";
  const highlights = project?.highlights ?? [];
  const tags = project?.tags ?? [];
  const prefersReducedMotion = useReducedMotion();

  const links = [
    {
      href: project?.liveUrl,
      label: t.projectDetail[PROJECT_DETAIL.liveDemoKey],
      Icon: ExternalLink,
    },
    {
      href: project?.repoUrl,
      label: t.projectDetail[PROJECT_DETAIL.repoKey],
      Icon: SiGithub,
    },
    {
      href: project?.npmUrl,
      label: t.projectDetail[PROJECT_DETAIL.npmKey],
      Icon: Package,
    },
  ].filter((link) => Boolean(link.href));

  return (
    <div className="space-y-10">
      <m.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? undefined : { duration: 0.6 }}
      >
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-4">
              <Rocket className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              {t.projectDetail[PROJECT_DETAIL.overviewTitleKey]}
            </h2>
            <p className="text-text-secondary leading-relaxed text-base md:text-lg">
              {description}
            </p>
          </CardContent>
        </Card>
      </m.div>

      {links.length > 0 && (
        <m.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-3">
            {links.map(({ href, label, Icon }) => (
              <Button
                key={label}
                nativeButton={false}
                render={
                  <a href={href} target="_blank" rel="noopener noreferrer" />
                }
                variant="outline"
                size="lg"
                className="min-h-[48px] gap-2 rounded-full border-accent/30 bg-accent/10 px-5 font-semibold text-accent transition-all duration-300 hover:bg-accent hover:text-bg-primary"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </m.div>
      )}

      {highlights.length > 0 && (
        <m.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                {t.projectDetail[PROJECT_DETAIL.highlightsTitleKey]}
              </h2>
              <ul className="space-y-6">
                {highlights.map((point, idx) => (
                  <m.li
                    key={idx}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4 text-text-secondary leading-relaxed text-base md:text-lg"
                  >
                    <span className="mt-2.5 w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                    <span>{point}</span>
                  </m.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </m.div>
      )}

      <m.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          {t.projectDetail[PROJECT_DETAIL.stackTitleKey]}
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-3 py-1 rounded-full border-accent/30 text-xs font-semibold text-accent bg-accent-muted/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </m.div>
    </div>
  );
}
