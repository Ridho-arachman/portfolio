"use client";

import { Badge } from "@/components/ui/badge";
import { useScroll, useTransform } from "framer-motion";
import * as m from "motion/react-m";
import { useRef } from "react";
import { ProjectCard } from "./project-card";
import { ProjectsBackground } from "./projects-background";
import type { Project } from "./constants";
import { REPLAY_VIEWPORT } from "./constants";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-24">
      <ProjectsBackground bgY1={bgY1} bgY2={bgY2} />

      <div className="container relative z-10 mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REPLAY_VIEWPORT}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            Selected Works
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Featured <span className="text-gradient-elegant">Projects</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A glimpse into my recent work, showcasing scalable architecture and
            immersive user experiences.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}