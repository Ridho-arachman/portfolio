"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { REPLAY_VIEWPORT } from "./constants";
import { ExperienceTimeline } from "./experience-timeline";
import type { Experience } from "./constants";

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            My Journey
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Work <span className="text-gradient-elegant">Experience</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A timeline of my professional growth, leadership roles, and
            real-world impact.
          </p>
        </div>

        {/* Timeline & Cards */}
        <ExperienceTimeline experiences={experiences} />

        {/* Bottom CTA (Shadcn UI Button) */}
        <div className="text-center mt-16 md:mt-24 animate-fade-in-up delay-400">
          <Button
            size="lg"
            className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group"
          >
            <Link href="/experience" className="inline-flex items-center gap-2">
              Lihat Semua Pengalaman
              <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}