"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useRef } from "react";
import { FEATURED_PROJECTS, REPLAY_VIEWPORT } from "./projects/constants";
import { ProjectCard } from "./projects/project-card";
import { ProjectsBackground } from "./projects/projects-background";

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax Background Elements
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-14">
      <ProjectsBackground bgY1={bgY1} bgY2={bgY2} />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {FEATURED_PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View All CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group"
          >
            <Link href="/projects" className="inline-flex items-center gap-3">
              View All Projects
              <ArrowUpRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
