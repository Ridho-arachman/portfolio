"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";

interface ProjectDetailContentProps {
  project: Project;
}

export function ProjectDetailContent({ project }: ProjectDetailContentProps) {
  return (
    <div className="space-y-10">
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-4">
              <Rocket className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              {PROJECT_DETAIL.overviewTitle}
            </h2>
            <p className="text-text-secondary leading-relaxed text-base md:text-lg">
              {project.description}
            </p>
          </CardContent>
        </Card>
      </m.div>

      {project.highlights && project.highlights.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                {PROJECT_DETAIL.highlightsTitle}
              </h2>
              <ul className="space-y-6">
                {project.highlights.map((point, idx) => (
                  <m.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          {PROJECT_DETAIL.stackTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
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