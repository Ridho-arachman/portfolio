"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProjectCardProps } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { t, locale } = useTranslation();
  return (
    <div
      className="group relative animate-fade-in-up scroll-reveal-up"
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both', animationRange: 'entry 0% cover 30%' }}
    >
      {/* Glow Effect behind card */}
      <div className="absolute -inset-0.5 bg-linear-to-br from-accent/30 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <Card
        className="relative h-full rounded-3xl bg-glass-bg backdrop-blur-xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] glass"
        style={{ borderWidth: 0, boxShadow: "none" }}
      >
        {/* Image Container - Asymmetric aspect ratios for bento variation */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        </div>

        {/* Shadcn UI Card Content */}
        <CardContent className="p-6 space-y-4">
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

          {/* Gallery Preview */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="flex gap-2 pt-3 border-t border-glass-border/60">
              {project.gallery.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-12 h-12 rounded-md overflow-hidden border border-glass-border"
                >
                  <Image
                    src={img}
                    alt={`${t.common.preview} ${idx + 1}`}
                    width={48}
                    height={48}
                    className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    sizes="48px"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  />
                </div>
              ))}
              {project.gallery.length > 5 && (
                <div className="shrink-0 w-12 h-12 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                  +{project.gallery.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Action Link using Shadcn Button */}
          <Button
            variant="ghost"
            className="h-auto p-0 mt-2 text-text-primary hover:text-accent hover:bg-transparent justify-start group/btn min-h-[48px] min-w-[48px]"
          >
            <Link
              href={`/${locale}/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold"
            >
              {t.projects.viewCaseStudy}
              <ArrowUpRight className="w-4 h-4 shrink-0 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}