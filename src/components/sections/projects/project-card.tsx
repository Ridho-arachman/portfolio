"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { cardVariants, ProjectCardProps, REPLAY_VIEWPORT } from "./constants";
import { useProjectCardTilt } from "./use-project-card-tilt";

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { cardRef, rotateX, rotateY, handleMouseMove, handleMouseLeave } =
    useProjectCardTilt();

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      transition={{ delay: index * 0.15 }}
      className="group relative h-full"
    >
      {/* Glow Effect behind card */}
      <div className="absolute -inset-0.5 bg-linear-to-br from-accent/30 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <Card
        className="relative h-full rounded-3xl bg-glass-bg backdrop-blur-xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(167,139,250,0.15)]"
        style={{ borderWidth: 0, boxShadow: "none" }} // <-- PAKSA HAPUS BORDER & SHADOW DEFAULT
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            style={{ transform: "translateZ(20px)" }}
            unoptimized
          />
        </div>

        {/* Shadcn UI Card Content */}
        <CardContent
          className="p-6 space-y-4"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Tags using Shadcn Badge */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-accent-muted/50 text-accent border-accent/20 font-medium hover:bg-accent/10 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-text-secondary leading-relaxed">
            {project.description}
          </p>

          {/* Action Link using Shadcn Button */}
          <Button
            variant="ghost"
            className="h-auto p-0 mt-2 text-text-primary hover:text-accent hover:bg-transparent justify-start group/btn"
          >
            <Link
              href={project.link}
              className="inline-flex items-center gap-2 text-sm font-semibold"
            >
              View Case Study
              <ArrowUpRight className="w-4 h-4 shrink-0 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </m.div>
  );
}
