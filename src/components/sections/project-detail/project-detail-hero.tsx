"use client";

import { Badge } from "@/components/ui/badge";
import { PROJECT_DETAIL } from "./constants";
import type { Project } from "./constants";
import { ArrowLeft, Calendar, User } from "lucide-react";
import type { MotionValue } from "framer-motion";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";

interface ProjectDetailHeroProps {
  project: Project;
  headerY: MotionValue<number>;
  headerScale: MotionValue<number>;
  headerOpacity: MotionValue<number>;
}

export function ProjectDetailHero({
  project,
  headerY,
  headerScale,
  headerOpacity,
}: ProjectDetailHeroProps) {
  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <m.div
        style={{ y: headerY, scale: headerScale }}
        className="absolute inset-0"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
      </m.div>

      <div className="absolute inset-0 bg-linear-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-bg-primary/40 to-transparent" />

      <div className="absolute top-24 left-0 right-0 z-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href={PROJECT_DETAIL.backHref}
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {PROJECT_DETAIL.backLabel}
          </Link>
        </div>
      </div>

      <m.div
        style={{ opacity: headerOpacity }}
        className="absolute bottom-0 left-0 right-0 z-10 pb-12"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="gap-1.5 px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md border-accent/30 text-xs font-semibold text-accent"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4 leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-text-secondary">
              {project.role && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" /> {project.role}
                </span>
              )}
              {project.year && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" /> {project.year}
                </span>
              )}
            </div>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}