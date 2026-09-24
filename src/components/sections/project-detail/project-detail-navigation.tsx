"use client";

import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "./constants";
import { PROJECT_DETAIL } from "./constants";
import { useTranslation } from "@/hooks/use-translation";

gsap.registerPlugin(ScrollTrigger);

interface ProjectDetailNavigationProps {
  prev: Project | null;
  next: Project | null;
}

interface NavCardProps {
  project: Project;
  direction: "prev" | "next";
  label: string;
}

function NavCard({ project, direction, label }: NavCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { locale } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top top",
        endTrigger: document.querySelector('[data-nav-stack-end]'),
        end: "top top",
        pin: true,
        pinSpacing: false,
      });
      gsap.to(cardRef.current, {
        scale: 0.92,
        opacity: 0.55,
        ease: "none",
        scrollTrigger: {
          trigger: document.querySelector('[data-nav-stack-end]') || cardRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    }, cardRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <m.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: direction === "prev" ? -30 : 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: direction === "prev" ? 0 : 0.15 }}
    >
      <Link
        href={`/${locale}/projects/${project.slug}`}
        className={`group block h-full ${direction === "next" ? "text-right" : ""}`}
      >
        <Card ref={cardRef} className="h-full rounded-2xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300">
          <CardContent className="p-0">
            <div
              className={`flex items-center gap-2 text-xs text-text-muted mb-2 ${
                direction === "next" ? "justify-end" : ""
              }`}
            >
              {direction === "prev" && (
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              )}
              {label}
              {direction === "next" && (
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
            <CardTitle className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
              {project.title}
            </CardTitle>
            <CardDescription className="text-sm text-text-secondary mt-1">
              {project.tags.slice(0, 2).join(" • ")}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    </m.div>
  );
}

export function ProjectDetailNavigation({
  prev,
  next,
}: ProjectDetailNavigationProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-24 pt-12 border-t border-glass-border" data-nav-stack-end>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prev ? (
          <NavCard project={prev} direction="prev" label={t.projectDetail[PROJECT_DETAIL.prevLabelKey]} />
        ) : (
          <div />
        )}
        {next ? (
          <NavCard project={next} direction="next" label={t.projectDetail[PROJECT_DETAIL.nextLabelKey]} />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}